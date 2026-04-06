/**
 * Full-text search over compiled wiki pages via SQLite FTS5.
 *
 * Uses a contentless FTS5 virtual table (`content=''`) to keep the database
 * small. The indexed text can always be rebuilt by re-scanning the wiki
 * directory with `indexCompiledPages`.
 *
 * All functions return `Result<T, Error>` — never throw. The caller is
 * responsible for inspecting `.ok` before using `.value`.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

import type { Database } from 'better-sqlite3';

import { err, ok, type Result } from '@ico/types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/**
 * Wiki subdirectories that contain compiled pages, in scan order.
 */
const WIKI_SCAN_DIRS: ReadonlyArray<string> = [
  'sources',
  'concepts',
  'entities',
  'topics',
  'contradictions',
  'open-questions',
];

/** Default maximum number of results returned by `searchPages`. */
const DEFAULT_LIMIT = 20;

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/**
 * A single result from `searchPages`.
 */
export interface SearchResult {
  /** Relative path within `wiki/` (e.g. `sources/my-doc.md`). */
  path: string;
  /** Page title extracted from YAML frontmatter. */
  title: string;
  /** Page type from frontmatter (e.g. `source-summary`, `concept`, `topic`). */
  type: string;
  /** FTS5 snippet with the matched term wrapped in `<b>…</b>` tags. */
  snippet: string;
  /** FTS5 relevance score. Lower values indicate higher relevance. */
  rank: number;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Raw row shape returned by better-sqlite3 for a search query. */
interface SearchRow {
  path: string;
  title: string;
  type: string;
  snippet: string;
  rank: number;
}

/**
 * Parse YAML frontmatter from the beginning of a markdown string.
 *
 * Expects the file to start with a `---` delimiter. Extracts `key: value`
 * pairs between the opening and closing `---` lines. Returns an empty object
 * when no frontmatter block is present.
 */
function parseFrontmatter(content: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (!content.startsWith('---')) {
    return result;
  }

  const afterOpen = content.indexOf('\n') + 1;
  const closeIndex = content.indexOf('\n---', afterOpen);

  if (closeIndex === -1) {
    return result;
  }

  const block = content.slice(afterOpen, closeIndex);

  for (const line of block.split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;

    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();

    if (key !== '') {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Extract the body of a markdown file by stripping the YAML frontmatter block.
 *
 * If the file does not begin with `---`, the entire content is returned as the
 * body. The leading blank line that typically follows the closing `---` is
 * also removed.
 */
function extractBody(content: string): string {
  if (!content.startsWith('---')) {
    return content;
  }

  const afterOpen = content.indexOf('\n') + 1;
  const closeIndex = content.indexOf('\n---', afterOpen);

  if (closeIndex === -1) {
    return content;
  }

  // Skip past the closing `---\n`
  const bodyStart = closeIndex + 4; // length of '\n---'
  return content.slice(bodyStart).trimStart();
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create the FTS5 virtual table for compiled wiki pages.
 *
 * `path` and `type` are declared `UNINDEXED` — they are stored for retrieval
 * but excluded from the inverted index, keeping the index compact. Full-text
 * search runs over `title`, `tags`, and `body` with Porter stemming and
 * unicode61 tokenization.
 *
 * Idempotent — safe to call multiple times.
 *
 * @param db - Open better-sqlite3 database instance.
 * @returns `ok(undefined)` on success, or `err(error)` if the DDL fails.
 */
export function createSearchIndex(db: Database): Result<void, Error> {
  try {
    db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS pages_fts USING fts5(
        path UNINDEXED,
        title,
        type UNINDEXED,
        tags,
        body,
        tokenize='porter unicode61'
      )
    `);
    return ok(undefined);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * Index all compiled wiki pages found under `workspacePath/wiki/`.
 *
 * Clears any existing FTS index entries, then scans the six wiki
 * subdirectories for `.md` files. For each file it parses the YAML
 * frontmatter (title, type, tags) and extracts the body, then inserts
 * a row into the FTS5 table.
 *
 * @param db            - Open better-sqlite3 database instance.
 * @param workspacePath - Absolute path to the workspace root.
 * @returns `ok(count)` with the number of pages indexed, or `err(error)`.
 */
export function indexCompiledPages(
  db: Database,
  workspacePath: string,
): Result<number, Error> {
  try {
    db.prepare('DELETE FROM pages_fts').run();
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }

  const insertStmt = db.prepare<[string, string, string, string, string], void>(
    'INSERT INTO pages_fts(path, title, type, tags, body) VALUES (?, ?, ?, ?, ?)',
  );

  const wikiPath = resolve(workspacePath, 'wiki');
  let count = 0;

  for (const dir of WIKI_SCAN_DIRS) {
    const dirPath = resolve(wikiPath, dir);

    if (!existsSync(dirPath)) {
      continue;
    }

    let files: string[];
    try {
      files = readdirSync(dirPath).filter(
        (f) => f.endsWith('.md') && f !== '.gitkeep',
      );
    } catch (e) {
      return err(e instanceof Error ? e : new Error(String(e)));
    }

    for (const filename of files) {
      const filePath = resolve(dirPath, filename);
      let content: string;

      try {
        content = readFileSync(filePath, 'utf-8');
      } catch (e) {
        return err(e instanceof Error ? e : new Error(String(e)));
      }

      const fm = parseFrontmatter(content);
      const body = extractBody(content);

      const relativePath = `${dir}/${filename}`;
      const title = fm['title'] ?? basename(filename, '.md');
      const type = fm['type'] ?? '';
      const tags = fm['tags'] ?? '';

      try {
        insertStmt.run(relativePath, title, type, tags, body);
      } catch (e) {
        return err(e instanceof Error ? e : new Error(String(e)));
      }

      count += 1;
    }
  }

  return ok(count);
}

/**
 * Search compiled wiki pages using an FTS5 MATCH query.
 *
 * Returns results ranked by relevance (lower rank = more relevant in FTS5).
 * Each result includes an FTS5 snippet with the matched term highlighted in
 * `<b>…</b>` tags, drawn from the `body` column (column index 4).
 *
 * @param db    - Open better-sqlite3 database instance.
 * @param query - FTS5 query string (keyword, phrase in quotes, boolean ops).
 * @param limit - Maximum number of results to return. Defaults to 20.
 * @returns `ok(results)` — an empty array when no pages match.
 */
export function searchPages(
  db: Database,
  query: string,
  limit: number = DEFAULT_LIMIT,
): Result<SearchResult[], Error> {
  let rows: SearchRow[];

  try {
    rows = db
      .prepare<[string, number], SearchRow>(
        `SELECT
           path,
           title,
           type,
           snippet(pages_fts, 4, '<b>', '</b>', '...', 32) AS snippet,
           rank
         FROM pages_fts
         WHERE pages_fts MATCH ?
         ORDER BY rank
         LIMIT ?`,
      )
      .all(query, limit);
  } catch (e) {
    return err(e instanceof Error ? e : new Error(String(e)));
  }

  return ok(rows);
}
