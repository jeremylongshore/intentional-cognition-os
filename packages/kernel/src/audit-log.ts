import { appendFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { ok, err, type Result } from '@ico/types';

/**
 * Append a single audit log entry to `audit/log.md` inside the workspace.
 *
 * The entry is appended as a Markdown table row:
 * `| <ISO timestamp> | <operation> | <summary> |`
 *
 * @param workspacePath - Absolute path to the workspace root.
 * @param operation     - Operation identifier (e.g. `workspace.init`).
 * @param summary       - One-line human-readable description of the event.
 * @returns             `ok(undefined)` on success, or an `err(Error)` if
 *                      `audit/log.md` does not exist (workspace not initialized).
 */
export function appendAuditLog(
  workspacePath: string,
  operation: string,
  summary: string,
): Result<void, Error> {
  const logPath = resolve(workspacePath, 'audit', 'log.md');

  if (!existsSync(logPath)) {
    return err(new Error(`Audit log not found at ${logPath}. Is the workspace initialized?`));
  }

  const timestamp = new Date().toISOString();
  const row = `| ${timestamp} | ${operation} | ${summary} |\n`;

  try {
    appendFileSync(logPath, row, 'utf-8');
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}
