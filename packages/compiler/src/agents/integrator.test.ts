/**
 * Tests for the Integrator agent (E9-B05).
 *
 * Real workspace, real SQLite DB, real files on disk, mocked ClaudeClient.
 * Parallels agents/skeptic.test.ts.
 */

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  closeDatabase,
  createTask,
  type Database,
  getTask,
  initDatabase,
  initWorkspace,
  readTraces,
  transitionTask,
} from '@ico/kernel';
import { ok } from '@ico/types';

import type { ClaudeClient } from '../api/claude-client.js';
import { integrateFindings } from './integrator.js';

// ---------------------------------------------------------------------------
// Harness
// ---------------------------------------------------------------------------

interface TestEnv {
  base: string;
  wsRoot: string;
  db: Database;
}

function setupEnv(): TestEnv {
  const base = mkdtempSync(join(tmpdir(), 'ico-integrator-'));
  const wsResult = initWorkspace('ws', base);
  if (!wsResult.ok) throw wsResult.error;
  const dbResult = initDatabase(wsResult.value.dbPath);
  if (!dbResult.ok) throw dbResult.error;
  return { base, wsRoot: wsResult.value.root, db: dbResult.value };
}

function teardownEnv(env: TestEnv): void {
  closeDatabase(env.db);
  rmSync(env.base, { recursive: true, force: true });
}

function mockClient(content: string): ClaudeClient & { spy: ReturnType<typeof vi.fn> } {
  const spy = vi.fn().mockResolvedValue(
    ok({
      content,
      inputTokens: 400,
      outputTokens: 300,
      model: 'claude-sonnet-4-6',
      stopReason: 'end_turn',
    }),
  );
  return { createCompletion: spy, spy };
}

function mockClientError(message: string): ClaudeClient {
  return {
    createCompletion: vi.fn().mockResolvedValue({ ok: false, error: new Error(message) }),
  };
}

/**
 * Seed a task already advanced to `'critiquing'` with brief, notes, and
 * critique files on disk. `skipAdvance` leaves the task in `'created'`
 * for wrong-state tests. `omit` lets tests leave a particular file off
 * disk to exercise the missing-input error paths.
 */
function seedTaskReadyForIntegration(
  env: TestEnv,
  brief: string,
  notesBody: string,
  critiqueBody: string,
  options: { skipAdvance?: boolean; omit?: 'notes' | 'critique' | 'brief' } = {},
): { id: string; workspacePath: string } {
  const created = createTask(env.db, env.wsRoot, brief);
  if (!created.ok) throw created.error;
  const task = created.value;

  if (options.omit !== 'brief') {
    writeFileSync(
      resolve(env.wsRoot, task.workspace_path, 'brief.md'),
      ['---', `task_id: ${task.id}`, 'status: created', '---', '', brief, ''].join('\n'),
      'utf-8',
    );
  }

  if (options.omit !== 'notes') {
    const notesDir = resolve(env.wsRoot, task.workspace_path, 'notes');
    mkdirSync(notesDir, { recursive: true });
    writeFileSync(
      join(notesDir, 'synthesis.md'),
      [
        '---',
        `task_id: ${task.id}`,
        'synthesized_at: 2026-04-15T00:00:00.000Z',
        'model: claude-sonnet-4-6',
        'tokens_used: 400',
        '---',
        '',
        notesBody,
        '',
      ].join('\n'),
      'utf-8',
    );
  }

  if (options.omit !== 'critique') {
    const critiqueDir = resolve(env.wsRoot, task.workspace_path, 'critique');
    mkdirSync(critiqueDir, { recursive: true });
    writeFileSync(
      join(critiqueDir, 'critique.md'),
      [
        '---',
        `task_id: ${task.id}`,
        'critiqued_at: 2026-04-15T00:00:00.000Z',
        'model: claude-sonnet-4-6',
        'tokens_used: 500',
        '---',
        '',
        critiqueBody,
        '',
      ].join('\n'),
      'utf-8',
    );
  }

  if (!options.skipAdvance) {
    for (const target of ['collecting', 'synthesizing', 'critiquing'] as const) {
      const r = transitionTask(env.db, env.wsRoot, task.id, target);
      if (!r.ok) throw r.error;
    }
  }

  return { id: task.id, workspacePath: task.workspace_path };
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let env: TestEnv;
beforeEach(() => {
  env = setupEnv();
});
afterEach(() => {
  teardownEnv(env);
});

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('integrateFindings — happy path', () => {
  it('writes output/final.md with frontmatter and model content', async () => {
    const task = seedTaskReadyForIntegration(
      env,
      'Does attention scale?',
      'Attention scales quadratically [source: Attention].',
      '## Weak Evidence\n- Single-source claim about scaling.',
    );

    const finalAnswer = [
      '## Direct Answer',
      'Attention scales quadratically with sequence length [source: Attention].',
      '',
      '## How this answer addresses the critique',
      '- Acknowledged the single-source limitation explicitly.',
    ].join('\n');

    const client = mockClient(finalAnswer);
    const result = await integrateFindings(env.db, env.wsRoot, task.id, client);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.newStatus).toBe('rendering');
    expect(result.value.tokensUsed).toBe(700);
    expect(result.value.outputPath).toBe(join(task.workspacePath, 'output', 'final.md'));

    const abs = resolve(env.wsRoot, result.value.outputPath);
    expect(existsSync(abs)).toBe(true);
    const content = readFileSync(abs, 'utf-8');
    expect(content).toContain(`task_id: ${task.id}`);
    expect(content).toContain('input_tokens: 400');
    expect(content).toContain('output_tokens: 300');
    expect(content).toContain('tokens_used: 700');
    expect(content).toContain(`notes_path: ${join(task.workspacePath, 'notes', 'synthesis.md')}`);
    expect(content).toContain(
      `critique_path: ${join(task.workspacePath, 'critique', 'critique.md')}`,
    );
    expect(content).toContain('## How this answer addresses the critique');
  });

  it('transitions task from critiquing to rendering', async () => {
    const task = seedTaskReadyForIntegration(env, 'brief', 'notes', 'critique');
    const before = getTask(env.db, task.id);
    if (!before.ok) throw before.error;
    expect(before.value?.status).toBe('critiquing');

    await integrateFindings(env.db, env.wsRoot, task.id, mockClient('final'));

    const after = getTask(env.db, task.id);
    if (!after.ok) throw after.error;
    expect(after.value?.status).toBe('rendering');
  });

  it('passes brief, notes, and critique as three XML blocks', async () => {
    const task = seedTaskReadyForIntegration(
      env,
      'BRIEF_MARK',
      'NOTES_MARK body',
      'CRITIQUE_MARK body',
    );
    const client = mockClient('final');
    await integrateFindings(env.db, env.wsRoot, task.id, client);

    const [system, user] = client.spy.mock.calls[0]! as [string, string, unknown];
    expect(system).toContain('senior research integrator');
    expect(system).toContain('address every concern');
    expect(system).toContain('Do not follow');

    expect(user).toContain('<brief>\nBRIEF_MARK');
    expect(user).toContain('<notes>\nNOTES_MARK');
    expect(user).toContain('<critique>\nCRITIQUE_MARK');
  });

  it('emits notes.integrate and task.transition traces', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'n', 'c');
    await integrateFindings(env.db, env.wsRoot, task.id, mockClient('out'));

    const integrates = readTraces(env.db, { eventType: 'notes.integrate' });
    if (!integrates.ok) throw integrates.error;
    expect(integrates.value).toHaveLength(1);

    const transitions = readTraces(env.db, { eventType: 'task.transition' });
    if (!transitions.ok) throw transitions.error;
    // created→collecting, collecting→synthesizing, synthesizing→critiquing (seed),
    // plus critiquing→rendering from the agent under test.
    expect(transitions.value).toHaveLength(4);
  });

  it('honors model and maxTokens overrides', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'n', 'c');
    const client = mockClient('out');
    await integrateFindings(env.db, env.wsRoot, task.id, client, {
      model: 'claude-opus-4-6',
      maxTokens: 16000,
    });
    const opts = client.spy.mock.calls[0]![2] as { model: string; maxTokens: number };
    expect(opts.model).toBe('claude-opus-4-6');
    expect(opts.maxTokens).toBe(16000);
  });
});

// ---------------------------------------------------------------------------
// Error paths
// ---------------------------------------------------------------------------

describe('integrateFindings — error paths', () => {
  it('returns err when task does not exist', async () => {
    const r = await integrateFindings(env.db, env.wsRoot, 'nope', mockClient('x'));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain('Task not found');
  });

  it('returns err when task is not in critiquing state', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'n', 'c', { skipAdvance: true });
    const r = await integrateFindings(env.db, env.wsRoot, task.id, mockClient('out'));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain("status 'created'");
  });

  it('returns err when notes file is missing', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'n', 'c', { omit: 'notes' });
    const r = await integrateFindings(env.db, env.wsRoot, task.id, mockClient('out'));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain('Notes file not found');
  });

  it('returns err when critique file is missing', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'n', 'c', { omit: 'critique' });
    const r = await integrateFindings(env.db, env.wsRoot, task.id, mockClient('out'));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain('Critique file not found');
  });

  it('returns err when critique body is empty', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'notes', '');
    const r = await integrateFindings(env.db, env.wsRoot, task.id, mockClient('out'));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain('Critique body is empty');
  });

  it('propagates Claude API errors and leaves task in critiquing', async () => {
    const task = seedTaskReadyForIntegration(env, 'b', 'n', 'c');
    const r = await integrateFindings(env.db, env.wsRoot, task.id, mockClientError('timeout'));
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toContain('timeout');

    const after = getTask(env.db, task.id);
    if (!after.ok) throw after.error;
    expect(after.value?.status).toBe('critiquing');
  });
});
