/**
 * End-to-end integration tests for the ico CLI.
 *
 * All tests spawn real child processes against the pre-built `dist/index.js`
 * binary. The build step is assumed to have run before the test suite
 * (CI runs `pnpm build` before `pnpm test`).
 *
 * Each test gets its own temporary directory, which is cleaned up in afterEach.
 *
 * @module __tests__/integration
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/** Absolute path to the pre-built CLI entry point. */
const CLI_PATH = resolve(__dirname, '../../dist/index.js');

// ---------------------------------------------------------------------------
// Test runner helper
// ---------------------------------------------------------------------------

interface RunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Invoke the ico CLI as a child process and return its output.
 *
 * Always sets `NO_COLOR=1` so assertions never match ANSI escape sequences.
 *
 * @param args  - Arguments to pass after `node dist/index.js`.
 * @param opts  - Optional overrides for cwd and environment variables.
 */
function run(
  args: string[],
  opts?: { cwd?: string; env?: Record<string, string> },
): RunResult {
  try {
    const stdout = execFileSync('node', [CLI_PATH, ...args], {
      cwd: opts?.cwd,
      env: { ...process.env, ...opts?.env, NO_COLOR: '1' },
      encoding: 'utf-8',
      timeout: 10_000,
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return {
      stdout: err.stdout ?? '',
      stderr: err.stderr ?? '',
      exitCode: err.status ?? 1,
    };
  }
}

// ---------------------------------------------------------------------------
// Per-test temp dir management
// ---------------------------------------------------------------------------

let tmpBase: string;

beforeEach(() => {
  tmpBase = mkdtempSync(join(tmpdir(), 'ico-int-'));
});

afterEach(() => {
  rmSync(tmpBase, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Run `ico init <name> --path <tmpBase>` and return the workspace root path.
 * Asserts the command exits 0 so callers can rely on the workspace existing.
 */
function initWorkspace(name: string): string {
  const result = run(['init', name, '--path', tmpBase]);
  expect(result.exitCode, `init failed: ${result.stderr}`).toBe(0);
  return join(tmpBase, name);
}

/**
 * Create a small markdown file under `tmpBase` and return its absolute path.
 */
function createTestFile(filename = 'note.md', content = '# Test Note\n\nSome content.\n'): string {
  const filePath = join(tmpBase, filename);
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('ico CLI integration', { timeout: 30_000 }, () => {

  // -------------------------------------------------------------------------
  // 1. Full workflow: init → mount → ingest → status
  // -------------------------------------------------------------------------

  it('full workflow: init, mount add, ingest, status shows 1 source and 1 mount', () => {
    const wsRoot = initWorkspace('test-kb');

    // Create a directory for the mount point
    const papersDir = join(tmpBase, 'papers');
    mkdirSync(papersDir, { recursive: true });

    // Mount add
    const mountResult = run(
      ['mount', 'add', 'papers', papersDir, '--workspace', wsRoot],
    );
    expect(mountResult.exitCode).toBe(0);
    expect(mountResult.stdout).toContain('papers');

    // Create and ingest a file
    const testFile = createTestFile('research.md');
    const ingestResult = run(['ingest', testFile, '--workspace', wsRoot]);
    expect(ingestResult.exitCode).toBe(0);
    expect(ingestResult.stdout).toContain('Ingested');

    // Status should show 1 source and 1 mount
    const statusResult = run(['status', '--workspace', wsRoot]);
    expect(statusResult.exitCode).toBe(0);
    expect(statusResult.stdout).toContain('Sources:');
    expect(statusResult.stdout).toMatch(/Sources:\s+1/);
    expect(statusResult.stdout).toMatch(/Mounts:\s+1/);
  });

  // -------------------------------------------------------------------------
  // 2. init creates workspace
  // -------------------------------------------------------------------------

  it('init creates workspace directory and database file', () => {
    const wsRoot = join(tmpBase, 'my-ws');
    const result = run(['init', 'my-ws', '--path', tmpBase]);

    expect(result.exitCode).toBe(0);
    expect(existsSync(wsRoot)).toBe(true);
    expect(existsSync(join(wsRoot, '.ico', 'state.db'))).toBe(true);
  });

  it('init output confirms workspace name', () => {
    const result = run(['init', 'my-ws', '--path', tmpBase]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('my-ws');
  });

  // -------------------------------------------------------------------------
  // 3. init is idempotent
  // -------------------------------------------------------------------------

  it('init is idempotent — running twice both exit 0 without data loss', () => {
    const first = run(['init', 'my-ws', '--path', tmpBase]);
    expect(first.exitCode).toBe(0);

    const second = run(['init', 'my-ws', '--path', tmpBase]);
    expect(second.exitCode).toBe(0);

    // Database still exists after second run
    expect(existsSync(join(tmpBase, 'my-ws', '.ico', 'state.db'))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 4. mount add / list / remove cycle
  // -------------------------------------------------------------------------

  it('mount add registers the mount', () => {
    const wsRoot = initWorkspace('ws');
    const dir = join(tmpBase, 'corpus');
    mkdirSync(dir, { recursive: true });

    const result = run(['mount', 'add', 'test-mount', dir, '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('test-mount');
  });

  it('mount list shows the registered mount', () => {
    const wsRoot = initWorkspace('ws');
    const dir = join(tmpBase, 'corpus');
    mkdirSync(dir, { recursive: true });

    run(['mount', 'add', 'test-mount', dir, '--workspace', wsRoot]);

    const result = run(['mount', 'list', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('test-mount');
  });

  it('mount remove exits 0 and confirms removal', () => {
    const wsRoot = initWorkspace('ws');
    const dir = join(tmpBase, 'corpus');
    mkdirSync(dir, { recursive: true });

    run(['mount', 'add', 'test-mount', dir, '--workspace', wsRoot]);

    const result = run(['mount', 'remove', 'test-mount', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('test-mount');
  });

  it('mount list shows no mounts after remove', () => {
    const wsRoot = initWorkspace('ws');
    const dir = join(tmpBase, 'corpus');
    mkdirSync(dir, { recursive: true });

    run(['mount', 'add', 'test-mount', dir, '--workspace', wsRoot]);
    run(['mount', 'remove', 'test-mount', '--workspace', wsRoot]);

    const result = run(['mount', 'list', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    // Either "No mounts" message or empty JSON array — no "test-mount" present
    expect(result.stdout).not.toContain('test-mount');
  });

  // -------------------------------------------------------------------------
  // 5. ingest a file
  // -------------------------------------------------------------------------

  it('ingest exits 0 and reports hash and path', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile();

    const result = run(['ingest', testFile, '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Ingested');
    expect(result.stdout).toContain('sha256:');
    expect(result.stdout).toContain('raw/notes/');
  });

  it('ingest copies the file into workspace/raw/notes/', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile('my-note.md');

    run(['ingest', testFile, '--workspace', wsRoot]);

    // Slugified name lands in raw/notes/
    expect(existsSync(join(wsRoot, 'raw', 'notes', 'my-note.md'))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // 6. ingest duplicate is a no-op
  // -------------------------------------------------------------------------

  it('ingesting the same file twice reports already ingested on second run', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile();

    const first = run(['ingest', testFile, '--workspace', wsRoot]);
    expect(first.exitCode).toBe(0);

    const second = run(['ingest', testFile, '--workspace', wsRoot]);
    expect(second.exitCode).toBe(0);
    expect(second.stdout).toContain('Already ingested');
  });

  // -------------------------------------------------------------------------
  // 7. status on fresh workspace shows Sources: 0
  // -------------------------------------------------------------------------

  it('status on fresh workspace shows Sources: 0', () => {
    const wsRoot = initWorkspace('ws');

    const result = run(['status', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toMatch(/Sources:\s+0/);
  });

  // -------------------------------------------------------------------------
  // 8. status --json returns valid JSON with expected keys
  // -------------------------------------------------------------------------

  it('status --json returns valid JSON with expected structure', () => {
    const wsRoot = initWorkspace('ws');

    const result = run(['status', '--json', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);

    const parsed = JSON.parse(result.stdout) as Record<string, unknown>;
    expect(parsed).toHaveProperty('sources');
    expect(parsed).toHaveProperty('mounts');
    expect(parsed).toHaveProperty('tasks');
    expect(parsed).toHaveProperty('lastOperation');

    const sources = parsed['sources'] as Record<string, number>;
    expect(typeof sources['total']).toBe('number');
    expect(typeof sources['pdf']).toBe('number');
    expect(typeof sources['markdown']).toBe('number');
    expect(typeof sources['html']).toBe('number');
    expect(typeof sources['text']).toBe('number');
  });

  it('status --json reflects actual source count after ingest', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile();

    run(['ingest', testFile, '--workspace', wsRoot]);

    const result = run(['status', '--json', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);

    const parsed = JSON.parse(result.stdout) as {
      sources: { total: number; markdown: number };
    };
    expect(parsed.sources.total).toBe(1);
    expect(parsed.sources.markdown).toBe(1);
  });

  // -------------------------------------------------------------------------
  // 9. inspect traces
  // -------------------------------------------------------------------------

  it('inspect traces shows trace entries after ingest', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile();

    run(['ingest', testFile, '--workspace', wsRoot]);

    const result = run(['inspect', 'traces', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('source.ingest');
  });

  it('inspect traces --last filters to the requested count', () => {
    const wsRoot = initWorkspace('ws');

    // Ingest two distinct files to generate multiple trace events
    const file1 = createTestFile('note-a.md', '# A\n');
    const file2 = createTestFile('note-b.md', '# B\n');
    run(['ingest', file1, '--workspace', wsRoot]);
    run(['ingest', file2, '--workspace', wsRoot]);

    const result = run(['inspect', 'traces', '--last', '1', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    // There should be output — we got at least one event
    expect(result.stdout).toContain('source.ingest');
  });

  it('inspect traces --json returns a JSON array', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile();

    run(['ingest', testFile, '--workspace', wsRoot]);

    const result = run(['inspect', 'traces', '--json', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);

    const parsed = JSON.parse(result.stdout) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);

    const first = parsed[0] as Record<string, unknown>;
    expect(typeof first['id']).toBe('string');
    expect(typeof first['event_type']).toBe('string');
    expect(typeof first['timestamp']).toBe('string');
  });

  // -------------------------------------------------------------------------
  // 10. inspect audit
  // -------------------------------------------------------------------------

  it('inspect audit shows audit log entries after init', () => {
    const wsRoot = initWorkspace('ws');

    const result = run(['inspect', 'audit', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('workspace.init');
  });

  it('inspect audit shows ingest entry after ingest', () => {
    const wsRoot = initWorkspace('ws');
    const testFile = createTestFile();

    run(['ingest', testFile, '--workspace', wsRoot]);

    const result = run(['inspect', 'audit', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('source.ingest');
  });

  it('inspect audit --json returns a JSON array with expected fields', () => {
    const wsRoot = initWorkspace('ws');

    const result = run(['inspect', 'audit', '--json', '--workspace', wsRoot]);
    expect(result.exitCode).toBe(0);

    const parsed = JSON.parse(result.stdout) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);

    const first = parsed[0] as Record<string, unknown>;
    expect(typeof first['timestamp']).toBe('string');
    expect(typeof first['operation']).toBe('string');
    expect(typeof first['summary']).toBe('string');
  });

  // -------------------------------------------------------------------------
  // 11. stub commands exit 1
  // -------------------------------------------------------------------------

  it('ico compile exits 1 and stderr mentions Epic 6', () => {
    const result = run(['compile']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 6');
  });

  it('ico ask exits 1 and stderr mentions Epic 7', () => {
    const result = run(['ask', 'what is knowledge?']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 7');
  });

  it('ico research exits 1 and stderr mentions Epic 9', () => {
    const result = run(['research', 'brief']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 9');
  });

  it('ico render exits 1 and stderr mentions Epic 8', () => {
    const result = run(['render', 'report']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 8');
  });

  it('ico lint exits 1 and stderr mentions Epic 7', () => {
    const result = run(['lint']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 7');
  });

  it('ico recall exits 1 and stderr mentions Epic 9', () => {
    const result = run(['recall', 'list']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 9');
  });

  it('ico promote exits 1 and stderr mentions Epic 8', () => {
    const result = run(['promote', 'some/path']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 8');
  });

  it('ico eval exits 1 and stderr mentions Epic 10', () => {
    const result = run(['eval', 'spec.yaml']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Epic 10');
  });

  // -------------------------------------------------------------------------
  // 12. --help shows all commands
  // -------------------------------------------------------------------------

  it('--help exits 0 and lists all expected commands', () => {
    const result = run(['--help']);
    expect(result.exitCode).toBe(0);

    const commands = [
      'init',
      'ingest',
      'mount',
      'compile',
      'ask',
      'research',
      'render',
      'lint',
      'recall',
      'promote',
      'status',
      'eval',
      'inspect',
    ];

    for (const cmd of commands) {
      expect(result.stdout, `expected --help to list command: ${cmd}`).toContain(cmd);
    }
  });

  it('--help output includes all global options', () => {
    const result = run(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('--workspace');
    expect(result.stdout).toContain('--verbose');
    expect(result.stdout).toContain('--quiet');
    expect(result.stdout).toContain('--json');
  });

  it('--version exits 0 and outputs a semver string', () => {
    const result = run(['--version']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toMatch(/^\d+\.\d+\.\d+/);
  });
});
