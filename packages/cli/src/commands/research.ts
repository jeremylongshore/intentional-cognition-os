/**
 * `ico research <brief>` — Create a scoped research task workspace (E9-B01).
 *
 * Creates an episodic task workspace with subdirectories for evidence, notes,
 * drafts, critique, and output. Writes a `brief.md` file with YAML frontmatter,
 * registers the task in SQLite, writes a trace event, and appends an audit log entry.
 *
 * @module commands/research
 */

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Command } from 'commander';

import {
  appendAuditLog,
  closeDatabase,
  createTask,
  initDatabase,
  type TaskRecord,
} from '@ico/kernel';

import { formatError, formatInfo, formatJSON, formatSuccess } from '../lib/output.js';
import { resolveWorkspace } from '../lib/workspace-resolver.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface GlobalOptions {
  json?: boolean;
  verbose?: boolean;
  workspace?: string;
}

export interface ResearchResult {
  taskId: string;
  brief: string;
  status: string;
  workspacePath: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Core logic (exported for testing)
// ---------------------------------------------------------------------------

/**
 * Run the research task creation pipeline.
 *
 * @param brief      - Short description of the research question or goal.
 * @param globalOpts - Global CLI flags (json, verbose, workspace).
 * @returns `{ ok: true, value: ResearchResult }` on success,
 *          or `{ ok: false, error: Error }` on failure.
 */
export function runResearch(
  brief: string,
  globalOpts: GlobalOptions,
): { ok: true; value: ResearchResult } | { ok: false; error: Error } {
  // 1. Resolve workspace
  const wsResolveOpts =
    globalOpts.workspace !== undefined ? { workspace: globalOpts.workspace } : {};
  const wsResult = resolveWorkspace(wsResolveOpts);
  if (!wsResult.ok) {
    return { ok: false, error: wsResult.error };
  }
  const { root: wsRoot, dbPath } = wsResult.value;

  // 2. Open database
  const dbResult = initDatabase(dbPath);
  if (!dbResult.ok) {
    return { ok: false, error: dbResult.error };
  }
  const db = dbResult.value;

  try {
    // 3. Create task (dirs, SQLite row, trace event)
    const taskResult = createTask(db, wsRoot, brief);
    if (!taskResult.ok) {
      return { ok: false, error: taskResult.error };
    }
    const task: TaskRecord = taskResult.value;

    // 4. Write brief.md with YAML frontmatter
    const briefContent = [
      '---',
      `task_id: ${task.id}`,
      `created_at: ${task.created_at}`,
      `status: ${task.status}`,
      '---',
      '',
      brief,
      '',
    ].join('\n');

    writeFileSync(join(wsRoot, task.workspace_path, 'brief.md'), briefContent, 'utf-8');

    // 5. Append audit log (best-effort; non-fatal)
    appendAuditLog(wsRoot, 'research.create', `Created research task ${task.id}: "${brief}"`);

    // 6. Build result
    const result: ResearchResult = {
      taskId: task.id,
      brief,
      status: task.status,
      workspacePath: task.workspace_path,
      createdAt: task.created_at,
    };

    // 7. Emit output
    if (globalOpts.json === true) {
      process.stdout.write(formatJSON(result) + '\n');
    } else {
      process.stdout.write('\n');
      process.stdout.write(formatSuccess(`Research task created`) + '\n');
      process.stdout.write(formatInfo(`  Task ID:   ${task.id}`) + '\n');
      process.stdout.write(formatInfo(`  Workspace: ${task.workspace_path}`) + '\n');
      process.stdout.write(formatInfo(`  Status:    ${task.status}`) + '\n');
      process.stdout.write(formatInfo(`  Brief:     ${brief}`) + '\n');
      process.stdout.write('\n');
    }

    return { ok: true, value: result };
  } finally {
    closeDatabase(db);
  }
}

// ---------------------------------------------------------------------------
// Commander registration
// ---------------------------------------------------------------------------

/**
 * Register `ico research <brief>` on the root Commander program.
 *
 * @param program - The root Commander `Command` instance.
 */
export function register(program: Command): void {
  program
    .command('research <brief>')
    .description('Start a multi-agent research task with an episodic workspace')
    .addHelpText(
      'after',
      '\nExamples:\n  $ ico research "How does self-attention scale with sequence length?"\n  $ ico research "Compare transformer architectures" --json',
    )
    .action((brief: string, _opts: Record<string, unknown>, cmd: Command) => {
      const globalOpts = cmd.optsWithGlobals<GlobalOptions>();
      const global: GlobalOptions = {
        ...(globalOpts.json !== undefined && { json: globalOpts.json }),
        ...(globalOpts.verbose !== undefined && { verbose: globalOpts.verbose }),
        ...(globalOpts.workspace !== undefined && { workspace: globalOpts.workspace }),
      };

      const result = runResearch(brief, global);
      if (!result.ok) {
        process.stderr.write(formatError(result.error.message) + '\n');
        process.exit(1);
      }
    });
}
