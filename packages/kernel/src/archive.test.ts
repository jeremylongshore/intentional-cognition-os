/**
 * Tests for archiveTask (E9-B07).
 *
 * Real workspace, real SQLite DB. Verifies:
 * - Completed task transitions to archived with timestamp.
 * - Non-completed tasks are rejected.
 * - Nonexistent tasks return err.
 * - Task directory is preserved (no deletion).
 */

import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { archiveTask } from './archive.js';
import type { Database } from './state.js';
import { closeDatabase, initDatabase } from './state.js';
import { createTask, getTask, transitionTask } from './tasks.js';
import { initWorkspace } from './workspace.js';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

let tmpDir: string;
let workspacePath: string;
let db: Database;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'ico-archive-'));
  const wsResult = initWorkspace('test', tmpDir);
  if (!wsResult.ok) throw wsResult.error;
  workspacePath = wsResult.value.root;

  const dbResult = initDatabase(wsResult.value.dbPath);
  if (!dbResult.ok) throw dbResult.error;
  db = dbResult.value;
});

afterEach(() => {
  closeDatabase(db);
  rmSync(tmpDir, { recursive: true, force: true });
});

/** Advance a task to completed. */
function advanceToCompleted(taskId: string): void {
  for (const s of ['collecting', 'synthesizing', 'critiquing', 'rendering', 'completed'] as const) {
    const r = transitionTask(db, workspacePath, taskId, s);
    if (!r.ok) throw r.error;
  }
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('archiveTask — happy path', () => {
  it('transitions a completed task to archived and sets archived_at', () => {
    const cr = createTask(db, workspacePath, 'Archive me');
    if (!cr.ok) throw cr.error;
    advanceToCompleted(cr.value.id);

    const r = archiveTask(db, workspacePath, cr.value.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    expect(r.value.status).toBe('archived');
    expect(r.value.archivedAt).toBeTruthy();
    expect(r.value.taskId).toBe(cr.value.id);

    const post = getTask(db, cr.value.id);
    expect(post.ok && post.value?.status).toBe('archived');
    expect(post.ok && post.value?.archived_at).not.toBeNull();
  });

  it('preserves the task directory (no files deleted)', () => {
    const cr = createTask(db, workspacePath, 'Preserve dirs');
    if (!cr.ok) throw cr.error;
    advanceToCompleted(cr.value.id);

    const taskRoot = join(workspacePath, cr.value.workspace_path);
    expect(existsSync(join(taskRoot, 'evidence'))).toBe(true);

    const r = archiveTask(db, workspacePath, cr.value.id);
    expect(r.ok).toBe(true);

    // All subdirectories still exist after archival.
    for (const dir of ['evidence', 'notes', 'drafts', 'critique', 'output']) {
      expect(existsSync(join(taskRoot, dir))).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Rejection cases
// ---------------------------------------------------------------------------

describe('archiveTask — rejection', () => {
  it('rejects a task in created status', () => {
    const cr = createTask(db, workspacePath, 'Not completed');
    if (!cr.ok) throw cr.error;

    const r = archiveTask(db, workspacePath, cr.value.id);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toMatch(/expected 'completed'/);
  });

  it('rejects a task in collecting status', () => {
    const cr = createTask(db, workspacePath, 'Mid-pipeline');
    if (!cr.ok) throw cr.error;
    transitionTask(db, workspacePath, cr.value.id, 'collecting');

    const r = archiveTask(db, workspacePath, cr.value.id);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toMatch(/expected 'completed'/);
  });

  it('rejects a nonexistent task', () => {
    const r = archiveTask(db, workspacePath, 'no-such-task');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toMatch(/not found/i);
  });

  it('rejects a task that is already archived', () => {
    const cr = createTask(db, workspacePath, 'Double archive');
    if (!cr.ok) throw cr.error;
    advanceToCompleted(cr.value.id);
    archiveTask(db, workspacePath, cr.value.id);

    const r = archiveTask(db, workspacePath, cr.value.id);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error.message).toMatch(/expected 'completed'/);
  });
});
