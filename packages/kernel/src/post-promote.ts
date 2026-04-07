/**
 * Post-promotion maintenance — wiki index rebuild and lint checks.
 *
 * After a promotion, the wiki index must be rebuilt to include the new page
 * and the promoted file should be validated for frontmatter compliance.
 *
 * All functions return `Result<T, Error>` — never throw.
 *
 * @module post-promote
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import type { Database } from 'better-sqlite3';
import matter from 'gray-matter';

import { err, ok, type Result } from '@ico/types';

import { writeTrace } from './traces.js';
import { rebuildWikiIndex } from './wiki-index.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single lint issue found on a promoted page.
 */
export interface LintIssue {
  /** Lint rule code (e.g. 'PROM001', 'PROM002'). */
  code: string;
  /** Issue severity. */
  severity: 'error' | 'warning';
  /** Human-readable description. */
  message: string;
  /** Workspace-relative path of the page that triggered the issue. */
  path: string;
}

/**
 * Result of a post-promotion refresh run.
 */
export interface PostPromotionResult {
  /** Total number of pages indexed after the rebuild. */
  indexedPages: number;
  /** All lint issues found on the promoted page. */
  lintIssues: LintIssue[];
}

// ---------------------------------------------------------------------------
// Internal DB row type
// ---------------------------------------------------------------------------

interface PromotionRow {
  id: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run post-promotion maintenance:
 *  1. Rebuild the wiki index to include the newly promoted page.
 *  2. Lint the promoted page for frontmatter compliance.
 *  3. Write a trace event recording the refresh.
 *
 * Lint checks performed (from promotion spec §13.3):
 *  - PROM001 (warning): Source file is missing from outputs/ — copy-not-move
 *    violation.
 *  - PROM002 (error): Promoted page has no `promoted_from` frontmatter field.
 *  - PROM003 (error): No record exists in the `promotions` table for this
 *    target path.
 *  - PROM004 (error): Promoted page frontmatter is missing the `title` field.
 *
 * @param db            - Open better-sqlite3 database with migrations applied.
 * @param workspacePath - Absolute path to the workspace root directory.
 * @param targetPath    - Workspace-relative path of the promoted page
 *                        (e.g. `wiki/topics/foo.md`).
 * @param sourcePath    - Workspace-relative path of the original artifact
 *                        (e.g. `outputs/reports/foo.md`).
 * @returns `ok(PostPromotionResult)` on success, or `err(Error)` if the
 *          wiki index rebuild fails or the trace cannot be written.
 */
export function runPostPromotionRefresh(
  db: Database,
  workspacePath: string,
  targetPath: string,
  sourcePath: string,
): Result<PostPromotionResult, Error> {
  // -------------------------------------------------------------------------
  // Step 1: Rebuild the wiki index
  // -------------------------------------------------------------------------

  const indexResult = rebuildWikiIndex(workspacePath);
  if (!indexResult.ok) {
    return err(indexResult.error);
  }

  const indexedPages = indexResult.value;

  // -------------------------------------------------------------------------
  // Step 2: Lint the promoted page
  // -------------------------------------------------------------------------

  const lintIssues: LintIssue[] = [];
  const absoluteTarget = join(workspacePath, targetPath);

  // PROM001: Check if source file still exists (copy-not-move verification).
  // This is a warning because the source may have been intentionally removed
  // after confirming the promotion.
  const absoluteSource = join(workspacePath, sourcePath);
  if (!existsSync(absoluteSource)) {
    lintIssues.push({
      code: 'PROM001',
      severity: 'warning',
      message: `Source file missing from outputs/ — was the file moved instead of copied? Expected: ${sourcePath}`,
      path: targetPath,
    });
  }

  // Read the promoted file for frontmatter checks.
  let fileContent: string;
  try {
    fileContent = readFileSync(absoluteTarget, 'utf-8');
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(fileContent);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }

  const fm = parsed.data;

  // PROM002: promoted_from field must be present.
  if (typeof fm['promoted_from'] !== 'string' || fm['promoted_from'].trim() === '') {
    lintIssues.push({
      code: 'PROM002',
      severity: 'error',
      message: 'Promoted page is missing the `promoted_from` frontmatter field',
      path: targetPath,
    });
  }

  // PROM003: Must have a corresponding promotions table record.
  const row = db
    .prepare<[string], PromotionRow>('SELECT id FROM promotions WHERE target_path = ?')
    .get(targetPath);

  if (row === undefined) {
    lintIssues.push({
      code: 'PROM003',
      severity: 'error',
      message: `No promotions table record found for target path: ${targetPath}`,
      path: targetPath,
    });
  }

  // PROM004: title field must be present.
  if (typeof fm['title'] !== 'string' || fm['title'].trim() === '') {
    lintIssues.push({
      code: 'PROM004',
      severity: 'error',
      message: 'Promoted page frontmatter is missing the required `title` field',
      path: targetPath,
    });
  }

  // -------------------------------------------------------------------------
  // Step 3: Write trace event
  // -------------------------------------------------------------------------

  const traceResult = writeTrace(
    db,
    workspacePath,
    'post-promotion-refresh',
    {
      targetPath,
      sourcePath,
      indexedPages,
      lintIssueCount: lintIssues.length,
    },
    {
      summary: `Post-promotion refresh: ${targetPath} (${lintIssues.length} issue(s), ${indexedPages} page(s) indexed)`,
    },
  );

  if (!traceResult.ok) {
    return err(traceResult.error);
  }

  return ok({ indexedPages, lintIssues });
}
