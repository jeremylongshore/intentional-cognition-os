import { chmodSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initWorkspace } from './workspace.js';

const EXPECTED_DIRS = [
  'raw/articles',
  'raw/papers',
  'raw/repos',
  'raw/notes',
  'wiki/sources',
  'wiki/concepts',
  'wiki/entities',
  'wiki/topics',
  'wiki/contradictions',
  'wiki/open-questions',
  'wiki/indexes',
  'tasks',
  'outputs/reports',
  'outputs/slides',
  'outputs/charts',
  'outputs/briefings',
  'recall/cards',
  'recall/decks',
  'recall/quizzes',
  'recall/retention',
  'audit/traces',
  'audit/provenance',
  'audit/policy',
  'audit/promotions',
  '.ico',
];

const WIKI_GITKEEP_DIRS = [
  'wiki/sources',
  'wiki/concepts',
  'wiki/entities',
  'wiki/topics',
  'wiki/contradictions',
  'wiki/open-questions',
  'wiki/indexes',
];

describe('initWorkspace', () => {
  let basePath: string;
  const workspaceName = 'test-workspace';

  beforeEach(() => {
    basePath = join(tmpdir(), `ico-ws-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  });

  afterEach(() => {
    rmSync(basePath, { recursive: true, force: true });
  });

  it('creates the full directory tree', () => {
    const result = initWorkspace(workspaceName, basePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const root = result.value.root;
    for (const dir of EXPECTED_DIRS) {
      expect(existsSync(resolve(root, dir)), `missing dir: ${dir}`).toBe(true);
    }

    // Verify we have at least 25 directories
    expect(EXPECTED_DIRS.length).toBeGreaterThanOrEqual(25);
  });

  it('creates wiki/index.md with valid frontmatter', () => {
    const result = initWorkspace(workspaceName, basePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const indexPath = resolve(result.value.root, 'wiki', 'index.md');
    expect(existsSync(indexPath)).toBe(true);

    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('---');
    expect(content).toContain('type: index');
    expect(content).toContain('title: Knowledge Index');
    expect(content).toContain('generated_at:');
    expect(content).toContain('# Knowledge Index');
    expect(content).toContain('_No compiled pages yet._');

    // generated_at should be a valid ISO 8601 timestamp
    const match = content.match(/generated_at:\s*(.+)/);
    expect(match).not.toBeNull();
    const captured = match?.[1];
    expect(captured).toBeDefined();
    if (captured == null) return;
    const ts = captured.trim();
    expect(() => new Date(ts).toISOString()).not.toThrow();
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it('creates audit/log.md with initialization entry', () => {
    const result = initWorkspace(workspaceName, basePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const logPath = resolve(result.value.root, 'audit', 'log.md');
    expect(existsSync(logPath)).toBe(true);

    const content = readFileSync(logPath, 'utf-8');
    expect(content).toContain('# ICO Audit Log');
    expect(content).toContain('| Timestamp | Operation | Summary |');
    expect(content).toContain('workspace.init');
    expect(content).toContain(`Workspace "${workspaceName}" initialized`);
  });

  it('creates audit/policy/size-limits.json with correct values', () => {
    const result = initWorkspace(workspaceName, basePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const limitsPath = resolve(result.value.root, 'audit', 'policy', 'size-limits.json');
    expect(existsSync(limitsPath)).toBe(true);

    const raw = readFileSync(limitsPath, 'utf-8');
    const limits = JSON.parse(raw) as Record<string, number>;

    expect(limits['pdf']).toBe(52428800);
    expect(limits['markdown']).toBe(5242880);
    expect(limits['html']).toBe(10485760);
    expect(limits['text']).toBe(5242880);
    expect(limits['code']).toBe(2097152);
    expect(limits['json']).toBe(10485760);
    expect(limits['image']).toBe(20971520);
    expect(limits['other']).toBe(5242880);
  });

  it('places .gitkeep in every wiki subdirectory', () => {
    const result = initWorkspace(workspaceName, basePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const root = result.value.root;
    for (const dir of WIKI_GITKEEP_DIRS) {
      const gitkeepPath = resolve(root, dir, '.gitkeep');
      expect(existsSync(gitkeepPath), `missing .gitkeep in ${dir}`).toBe(true);
    }
  });

  it('is idempotent — running twice does not destroy existing data', () => {
    // First run
    const first = initWorkspace(workspaceName, basePath);
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    // Record original seed-file content and verify it persists unchanged after the second run
    const indexPath = resolve(first.value.root, 'wiki', 'index.md');
    const originalContent = readFileSync(indexPath, 'utf-8');
    const auditLogPath = resolve(first.value.root, 'audit', 'log.md');
    const originalAuditContent = readFileSync(auditLogPath, 'utf-8');

    // Second run
    const second = initWorkspace(workspaceName, basePath);
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    // Seed files must be unchanged
    expect(readFileSync(indexPath, 'utf-8')).toBe(originalContent);
    expect(readFileSync(auditLogPath, 'utf-8')).toBe(originalAuditContent);

    // All directories still exist
    const root = second.value.root;
    for (const dir of EXPECTED_DIRS) {
      expect(existsSync(resolve(root, dir)), `dir disappeared after second run: ${dir}`).toBe(true);
    }
  });

  it('returns correct WorkspaceInfo with absolute paths', () => {
    const result = initWorkspace(workspaceName, basePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const info = result.value;
    expect(info.name).toBe(workspaceName);

    // root must be absolute and end with the workspace name
    expect(info.root).toBe(resolve(basePath, workspaceName));
    expect(info.root.startsWith('/')).toBe(true);

    // dbPath must be absolute and point to .ico/state.db under root
    expect(info.dbPath).toBe(resolve(info.root, '.ico', 'state.db'));
    expect(info.dbPath.startsWith('/')).toBe(true);

    // createdAt must be a valid ISO 8601 timestamp
    expect(() => new Date(info.createdAt).toISOString()).not.toThrow();
    expect(new Date(info.createdAt).toISOString()).toBe(info.createdAt);
  });

  it('returns err when basePath is not writable', () => {
    // Create a read-only directory and attempt to init inside it.
    const readonlyBase = join(
      tmpdir(),
      `ico-ws-readonly-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    );
    mkdirSync(readonlyBase, { recursive: true });
    chmodSync(readonlyBase, 0o444);

    try {
      const result = initWorkspace(workspaceName, readonlyBase);
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error).toBeInstanceOf(Error);
    } finally {
      // Restore permissions before cleanup so rmSync can delete it
      chmodSync(readonlyBase, 0o755);
      rmSync(readonlyBase, { recursive: true, force: true });
    }
  });
});
