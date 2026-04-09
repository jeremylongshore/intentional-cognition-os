/**
 * Cognitive procfs — computed views over task state.
 *
 * Inspired by Unix `/proc`: read-only files computed from existing SQLite
 * rows and filesystem state. The kernel computes these views; agents read
 * them. No agent can write to `_proc/` directly.
 *
 * Phase 1 (current): two views — `status.md` and `memory-map.md`.
 * Both are pure functions that return markdown strings.
 *
 * All functions return `Result<T, Error>` — never throw.
 */

import { mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Database } from 'better-sqlite3';

import { err, ok, type Result } from '@ico/types';

import { getTask, type TaskRecord } from './tasks.js';
import { readTraces } from './traces.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** Structured data behind a computed status view. */
export interface TaskStatusView {
  task_id: string;
  workspace_path: string;
  phase: string;
  brief: string;
  created_at: string;
  updated_at: string;
  age_hours: number;
  transitions: number;
  evidence_count: number;
  notes_count: number;
  drafts_count: number;
  output_count: number;
}

/** A single entry in the memory map view. */
export interface MemoryMapSection {
  name: string;
  file_count: number;
  files: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Count files (non-directory entries) in a directory.
 * Returns 0 if the directory does not exist.
 */
function countFiles(dirPath: string): { count: number; names: string[] } {
  try {
    const entries = readdirSync(dirPath);
    const files: string[] = [];
    for (const entry of entries) {
      try {
        const s = statSync(join(dirPath, entry));
        if (s.isFile()) {
          files.push(entry);
        }
      } catch {
        // Skip entries we cannot stat.
      }
    }
    return { count: files.length, names: files };
  } catch {
    return { count: 0, names: [] };
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute a task's cognitive status from SQLite + traces + filesystem.
 *
 * Returns structured data that can be rendered as markdown or JSON.
 * The view is derived entirely from existing state — no model involved.
 *
 * @param db            - Open better-sqlite3 database.
 * @param workspacePath - Absolute path to the workspace root.
 * @param taskId        - UUID of the task to inspect.
 * @returns `ok(TaskStatusView)` or `err(Error)`.
 */
export function computeTaskStatus(
  db: Database,
  workspacePath: string,
  taskId: string,
): Result<TaskStatusView, Error> {
  try {
    const taskResult = getTask(db, taskId);
    if (!taskResult.ok) return err(taskResult.error);
    if (taskResult.value === null) {
      return err(new Error(`Task not found: ${taskId}`));
    }

    const task: TaskRecord = taskResult.value;
    const taskDir = join(workspacePath, task.workspace_path);

    // Count transitions from trace events for this task.
    // Note: traces don't currently store taskId as correlationId, so we
    // count all task.transition events. This is accurate when only one task
    // exists. For multi-task workspaces, Phase 2 should add taskId as
    // correlationId to task.transition trace events for precise filtering.
    const tracesResult = readTraces(db, { eventType: 'task.transition' });
    let transitions = 0;
    if (tracesResult.ok) {
      transitions = tracesResult.value.length;
    }

    // Count files in each task subdirectory.
    const evidence = countFiles(join(taskDir, 'evidence'));
    const notes = countFiles(join(taskDir, 'notes'));
    const drafts = countFiles(join(taskDir, 'drafts'));
    const output = countFiles(join(taskDir, 'output'));

    const age = Date.now() - new Date(task.created_at).getTime();
    const ageHours = Math.round((age / 3_600_000) * 10) / 10;

    return ok({
      task_id: task.id,
      workspace_path: task.workspace_path,
      phase: task.status,
      brief: task.brief,
      created_at: task.created_at,
      updated_at: task.updated_at,
      age_hours: ageHours,
      transitions,
      evidence_count: evidence.count,
      notes_count: notes.count,
      drafts_count: drafts.count,
      output_count: output.count,
    });
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Render a TaskStatusView as markdown with YAML frontmatter.
 *
 * This is the content that would appear in `_proc/status.md`.
 */
export function renderTaskStatusMarkdown(view: TaskStatusView): string {
  return [
    '---',
    `task_id: "${view.task_id}"`,
    `workspace_path: "${view.workspace_path}"`,
    `phase: "${view.phase}"`,
    `brief: "${view.brief.replace(/"/g, '\\"')}"`,
    `created_at: "${view.created_at}"`,
    `updated_at: "${view.updated_at}"`,
    `age_hours: ${view.age_hours}`,
    `transitions: ${view.transitions}`,
    `evidence_count: ${view.evidence_count}`,
    `notes_count: ${view.notes_count}`,
    `drafts_count: ${view.drafts_count}`,
    `output_count: ${view.output_count}`,
    '---',
    '',
    '# Task Status',
    '',
    `**Phase:** ${view.phase}`,
    `**Brief:** ${view.brief}`,
    `**Created:** ${view.created_at}`,
    `**Age:** ${view.age_hours}h`,
    `**Transitions:** ${view.transitions}`,
    '',
    '## Working Set',
    '',
    `- Evidence: ${view.evidence_count} files`,
    `- Notes: ${view.notes_count} files`,
    `- Drafts: ${view.drafts_count} files`,
    `- Output: ${view.output_count} files`,
    '',
  ].join('\n');
}

/**
 * Compute a memory map: what files exist in each task subdirectory,
 * with sizes and names. Derived entirely from the filesystem.
 *
 * @param workspacePath - Absolute path to the workspace root.
 * @param taskId        - UUID of the task (used to locate the task dir).
 * @param taskRelPath   - Relative path to the task dir (e.g. `tasks/tsk-<id>`).
 * @returns `ok(sections[])` or `err(Error)`.
 */
export function computeMemoryMap(
  workspacePath: string,
  taskRelPath: string,
): Result<MemoryMapSection[], Error> {
  try {
    const taskDir = join(workspacePath, taskRelPath);
    const sectionNames = ['evidence', 'notes', 'drafts', 'critique', 'output'];
    const sections: MemoryMapSection[] = [];

    for (const name of sectionNames) {
      const { count, names } = countFiles(join(taskDir, name));
      sections.push({ name, file_count: count, files: names });
    }

    return ok(sections);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Render a memory map as markdown.
 *
 * This is the content that would appear in `_proc/memory-map.md`.
 */
export function renderMemoryMapMarkdown(sections: MemoryMapSection[]): string {
  const lines: string[] = ['# Memory Map', ''];

  for (const section of sections) {
    lines.push(`## ${section.name}/ (${section.file_count} files)`);
    if (section.files.length > 0) {
      for (const f of section.files) {
        lines.push(`- ${f}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Materialize `_proc/status.md` on disk for a given task.
 *
 * Creates the `_proc/` directory if it does not exist and writes the
 * computed status view as a markdown file. Intended to be called by
 * `transitionTask()` or on-demand by the CLI.
 *
 * @param db            - Open better-sqlite3 database.
 * @param workspacePath - Absolute path to the workspace root.
 * @param taskId        - UUID of the task.
 * @param taskRelPath   - Relative path to the task dir.
 * @returns `ok(filePath)` where filePath is the absolute path written,
 *          or `err(Error)`.
 */
export function materializeStatus(
  db: Database,
  workspacePath: string,
  taskId: string,
  taskRelPath: string,
): Result<string, Error> {
  const statusResult = computeTaskStatus(db, workspacePath, taskId);
  if (!statusResult.ok) return err(statusResult.error);

  const markdown = renderTaskStatusMarkdown(statusResult.value);
  const procDir = join(workspacePath, taskRelPath, '_proc');
  const filePath = join(procDir, 'status.md');

  try {
    mkdirSync(procDir, { recursive: true });
    writeFileSync(filePath, markdown, 'utf-8');
    return ok(filePath);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
