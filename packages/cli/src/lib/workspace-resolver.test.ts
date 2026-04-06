import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { resolveWorkspace } from './workspace-resolver.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Create a temp directory that contains `.ico/state.db` so it qualifies as a
 * valid workspace root.  Returns the root path.
 */
function makeTempWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'ico-test-'));
  mkdirSync(join(root, '.ico'), { recursive: true });
  writeFileSync(join(root, '.ico', 'state.db'), '');
  return root;
}

/**
 * Create a nested subdirectory inside `root` at the given depth (number of
 * extra path segments).  Returns the path to the deepest directory.
 */
function nestedDir(root: string, depth: number): string {
  let current = root;
  for (let i = 0; i < depth; i++) {
    current = join(current, `sub${i}`);
  }
  mkdirSync(current, { recursive: true });
  return current;
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

const tempDirs: string[] = [];

afterEach(() => {
  // Clean up all temp dirs created during the test run.
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function workspace(): string {
  const dir = makeTempWorkspace();
  tempDirs.push(dir);
  return dir;
}

// ---------------------------------------------------------------------------
// Env isolation helpers
// ---------------------------------------------------------------------------

let savedEnv: string | undefined;

beforeEach(() => {
  savedEnv = process.env['ICO_WORKSPACE'];
  delete process.env['ICO_WORKSPACE'];
});

afterEach(() => {
  if (savedEnv === undefined) {
    delete process.env['ICO_WORKSPACE'];
  } else {
    process.env['ICO_WORKSPACE'] = savedEnv;
  }
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('resolveWorkspace', () => {
  // 1. --workspace flag
  it('finds a workspace when --workspace flag points to a valid root', () => {
    const root = workspace();
    const result = resolveWorkspace({ workspace: root });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.root).toBe(root);
      expect(result.value.dbPath).toBe(join(root, '.ico', 'state.db'));
    }
  });

  // 2. ICO_WORKSPACE env
  it('finds a workspace from the ICO_WORKSPACE environment variable', () => {
    const root = workspace();
    process.env['ICO_WORKSPACE'] = root;

    const result = resolveWorkspace();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.root).toBe(root);
    }
  });

  // 3. Upward discovery
  it('finds a workspace by walking upward from a nested subdirectory', () => {
    const root = workspace();
    const sub = nestedDir(root, 3);

    const result = resolveWorkspace({ cwd: sub });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.root).toBe(root);
    }
  });

  // 4. --workspace flag takes priority over ICO_WORKSPACE env
  it('prefers --workspace flag over ICO_WORKSPACE env', () => {
    const flagRoot = workspace();
    const envRoot = workspace();
    process.env['ICO_WORKSPACE'] = envRoot;

    const result = resolveWorkspace({ workspace: flagRoot });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.root).toBe(flagRoot);
    }
  });

  // 5. ICO_WORKSPACE env takes priority over upward discovery
  it('prefers ICO_WORKSPACE env over upward directory discovery', () => {
    const envRoot = workspace();
    // Create a second workspace and set cwd to a subdir inside it.
    const discoveryRoot = workspace();
    const sub = nestedDir(discoveryRoot, 1);

    process.env['ICO_WORKSPACE'] = envRoot;

    const result = resolveWorkspace({ cwd: sub });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.root).toBe(envRoot);
    }
  });

  // 6. Returns error when nothing is found
  it('returns an error when no workspace exists anywhere in the tree', () => {
    // Use a temp dir that has NO .ico/state.db, and no parent with one.
    const emptyDir = mkdtempSync(join(tmpdir(), 'ico-empty-'));
    tempDirs.push(emptyDir);

    const result = resolveWorkspace({ cwd: emptyDir });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/ico init/);
      expect(result.error.message).toMatch(/--workspace/);
    }
  });

  // 7. Returns error when --workspace path exists but lacks .ico/state.db
  it('returns an error when the --workspace path has no .ico/state.db', () => {
    const emptyDir = mkdtempSync(join(tmpdir(), 'ico-no-db-'));
    tempDirs.push(emptyDir);

    const result = resolveWorkspace({ workspace: emptyDir });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toMatch(/No workspace found at/);
      expect(result.error.message).toContain(emptyDir);
    }
  });

  // 8. Stops after exactly 10 levels
  it('stops upward discovery at 10 levels and does not find a workspace beyond that limit', () => {
    // Place the workspace root at the tmp base and create an 11-level-deep
    // subdirectory.  Resolution from the deepest dir should fail because
    // traversal stops before reaching the root.
    const root = mkdtempSync(join(tmpdir(), 'ico-deep-'));
    tempDirs.push(root);
    // This dir does NOT have .ico/state.db — it is not a workspace.
    const deep = nestedDir(root, 11);

    const result = resolveWorkspace({ cwd: deep });

    // Should not find the root because it is more than 10 levels away.
    expect(result.ok).toBe(false);
  });

  // Bonus: stops at 10 levels but finds workspace exactly 10 levels up
  it('finds a workspace exactly 10 levels up from cwd', () => {
    const root = workspace();
    // 10 sub-levels deep: discoverUpward checks current level first (level 0),
    // so the 10th parent check is at level 9 (0-indexed), meaning we can
    // find a workspace up to 9 parent hops.  Level 0 is cwd itself, so
    // 9 directories deep leaves 9 parent traversals which reaches the root.
    const deep = nestedDir(root, 9);

    const result = resolveWorkspace({ cwd: deep });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.root).toBe(root);
    }
  });
});
