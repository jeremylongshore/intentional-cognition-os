/**
 * Tests for the `ico ingest` command logic.
 *
 * All tests exercise `runIngest` directly — no process spawning needed.
 * Filesystem operations are performed against real temporary directories
 * so we validate actual side-effects (file copies, database records, traces).
 */

import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from '@ico/kernel';
import { closeDatabase, initDatabase, initWorkspace, readTraces } from '@ico/kernel';

import { detectSourceType, type GlobalOptions, type IngestOptions, runIngest, slugify } from './ingest.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tmpBase(): string {
  return mkdtempSync(join(tmpdir(), 'ico-ingest-test-'));
}

/** Create a file at `filePath` with the given text content. */
function writeFile(filePath: string, content = 'test content'): void {
  writeFileSync(filePath, content, 'utf-8');
}

// ---------------------------------------------------------------------------
// Fixture setup
// ---------------------------------------------------------------------------

describe('runIngest', () => {
  let tempBase: string;
  let workspaceRoot: string;
  let db: Database;

  const globalOpts = (): GlobalOptions => ({ workspace: workspaceRoot, json: false });
  const ingestOpts = (): IngestOptions => ({});

  beforeEach(() => {
    tempBase = tmpBase();

    // Initialize a real ICO workspace.
    const wsResult = initWorkspace('ws', tempBase);
    if (!wsResult.ok) throw new Error(`initWorkspace failed: ${wsResult.error.message}`);
    workspaceRoot = wsResult.value.root;

    // Migrate the database.
    const dbResult = initDatabase(wsResult.value.dbPath);
    if (!dbResult.ok) throw new Error(`initDatabase failed: ${dbResult.error.message}`);
    db = dbResult.value;
    // Close here — runIngest will open its own connection.
    closeDatabase(db);

    // Suppress stdout/stderr output during tests.
    vi.spyOn(process.stdout, 'write').mockReturnValue(true);
    vi.spyOn(process.stderr, 'write').mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    rmSync(tempBase, { recursive: true, force: true });
  });

  // -------------------------------------------------------------------------
  // Happy path — text file
  // -------------------------------------------------------------------------

  it('ingests a text file and copies it to raw/notes/', () => {
    const srcFile = join(tempBase, 'notes.txt');
    writeFile(srcFile);

    const result = runIngest(srcFile, ingestOpts(), globalOpts());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.type).toBe('text');
    expect(result.value.path).toBe('raw/notes/notes.txt');
    expect(existsSync(join(workspaceRoot, 'raw', 'notes', 'notes.txt'))).toBe(true);
  });

  it('registers the text file in the database', () => {
    const srcFile = join(tempBase, 'notes.txt');
    writeFile(srcFile);

    const result = runIngest(srcFile, ingestOpts(), globalOpts());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(typeof result.value.id).toBe('string');
    expect(result.value.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  // -------------------------------------------------------------------------
  // Happy path — markdown file
  // -------------------------------------------------------------------------

  it('ingests a markdown file and copies it to raw/notes/', () => {
    const srcFile = join(tempBase, 'my-note.md');
    writeFile(srcFile, '# Hello\n\nSome content.');

    const result = runIngest(srcFile, ingestOpts(), globalOpts());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.type).toBe('markdown');
    expect(result.value.path).toBe('raw/notes/my-note.md');
    expect(existsSync(join(workspaceRoot, 'raw', 'notes', 'my-note.md'))).toBe(true);
  });

  // -------------------------------------------------------------------------
  // No-op re-ingest (same hash)
  // -------------------------------------------------------------------------

  it('returns alreadyIngested=true and no duplicate when re-ingesting the same file', () => {
    const srcFile = join(tempBase, 'doc.txt');
    writeFile(srcFile, 'stable content');

    // First ingest
    const first = runIngest(srcFile, ingestOpts(), globalOpts());
    expect(first.ok).toBe(true);
    if (!first.ok) return;

    // Second ingest — same file, same content
    const second = runIngest(srcFile, ingestOpts(), globalOpts());
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    expect(second.value.alreadyIngested).toBe(true);
    expect(second.value.id).toBe(first.value.id);
  });

  it('does not create a second database record on re-ingest', () => {
    const srcFile = join(tempBase, 'doc.txt');
    writeFile(srcFile, 'stable content');

    runIngest(srcFile, ingestOpts(), globalOpts());
    runIngest(srcFile, ingestOpts(), globalOpts());

    // Open DB and count sources at the same relative path.
    const wsResult = initWorkspace('ws', tempBase);
    if (!wsResult.ok) throw wsResult.error;
    const dbPath = join(workspaceRoot, '.ico', 'state.db');
    const dbResult = initDatabase(dbPath);
    if (!dbResult.ok) throw dbResult.error;
    const localDb = dbResult.value;

    try {
      const rows = localDb
        .prepare<[string], { count: number }>('SELECT COUNT(*) as count FROM sources WHERE path = ?')
        .get('raw/notes/doc.txt');
      expect(rows?.count).toBe(1);
    } finally {
      closeDatabase(localDb);
    }
  });

  // -------------------------------------------------------------------------
  // --title option
  // -------------------------------------------------------------------------

  it('sets title in the source record when --title is provided', () => {
    const srcFile = join(tempBase, 'paper.txt');
    writeFile(srcFile, 'research content');

    const result = runIngest(srcFile, { title: 'My Paper Title' }, globalOpts());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const dbPath = join(workspaceRoot, '.ico', 'state.db');
    const dbResult = initDatabase(dbPath);
    if (!dbResult.ok) throw dbResult.error;
    const localDb = dbResult.value;

    try {
      const row = localDb
        .prepare<[string], { title: string | null }>('SELECT title FROM sources WHERE id = ?')
        .get(result.value.id);
      expect(row?.title).toBe('My Paper Title');
    } finally {
      closeDatabase(localDb);
    }
  });

  // -------------------------------------------------------------------------
  // File not found
  // -------------------------------------------------------------------------

  it('returns an error when the file does not exist', () => {
    const missingFile = join(tempBase, 'ghost.txt');

    const result = runIngest(missingFile, ingestOpts(), globalOpts());

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.error.message).toMatch(/not found/i);
    expect(result.error.message).toContain('ghost.txt');
  });

  // -------------------------------------------------------------------------
  // Trace event written
  // -------------------------------------------------------------------------

  it('writes a trace event after successful ingest', () => {
    const srcFile = join(tempBase, 'traced.txt');
    writeFile(srcFile, 'traceable content');

    const ingestResult = runIngest(srcFile, ingestOpts(), globalOpts());
    expect(ingestResult.ok).toBe(true);
    if (!ingestResult.ok) return;

    const dbPath = join(workspaceRoot, '.ico', 'state.db');
    const dbResult = initDatabase(dbPath);
    if (!dbResult.ok) throw dbResult.error;
    const localDb = dbResult.value;

    try {
      const tracesResult = readTraces(localDb, { eventType: 'source.ingest' });
      expect(tracesResult.ok).toBe(true);
      if (!tracesResult.ok) return;

      expect(tracesResult.value.length).toBeGreaterThanOrEqual(1);
      const trace = tracesResult.value[0]!;
      expect(trace.event_type).toBe('source.ingest');
    } finally {
      closeDatabase(localDb);
    }
  });

  // -------------------------------------------------------------------------
  // Audit log entry
  // -------------------------------------------------------------------------

  it('appends an entry to audit/log.md after ingest', () => {
    const srcFile = join(tempBase, 'audited.txt');
    writeFile(srcFile, 'auditable content');

    const result = runIngest(srcFile, ingestOpts(), globalOpts());
    expect(result.ok).toBe(true);

    const logPath = join(workspaceRoot, 'audit', 'log.md');
    expect(existsSync(logPath)).toBe(true);

    const logContent = readFileSync(logPath, 'utf-8');
    expect(logContent).toContain('source.ingest');
    expect(logContent).toContain('audited.txt');
  });

  // -------------------------------------------------------------------------
  // JSON output mode
  // -------------------------------------------------------------------------

  it('writes JSON to stdout when globalOpts.json is true', () => {
    const stdoutMock = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const srcFile = join(tempBase, 'jsonout.txt');
    writeFile(srcFile, 'json output test');

    const result = runIngest(srcFile, ingestOpts(), { ...globalOpts(), json: true });

    expect(result.ok).toBe(true);

    const written = stdoutMock.mock.calls.map((c) => String(c[0])).join('');
    const parsed = JSON.parse(written.trim()) as Record<string, unknown>;

    expect(typeof parsed['id']).toBe('string');
    expect(parsed['type']).toBe('text');
    expect(typeof parsed['hash']).toBe('string');
    expect(typeof parsed['path']).toBe('string');
    expect(typeof parsed['ingestedAt']).toBe('string');
  });

  // -------------------------------------------------------------------------
  // Hash is recorded
  // -------------------------------------------------------------------------

  it('records the SHA-256 hash in the result', () => {
    const srcFile = join(tempBase, 'hashed.txt');
    writeFile(srcFile, 'hashed content');

    const result = runIngest(srcFile, ingestOpts(), globalOpts());

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value.hash).toMatch(/^[0-9a-f]{64}$/);
  });

  // -------------------------------------------------------------------------
  // Slug and type detection covered by unit tests below
  // -------------------------------------------------------------------------
});

// ---------------------------------------------------------------------------
// Unit tests for pure helpers
// ---------------------------------------------------------------------------

describe('detectSourceType', () => {
  it('maps .pdf to pdf', () => {
    expect(detectSourceType('paper.pdf')).toBe('pdf');
    expect(detectSourceType('/abs/path/file.PDF')).toBe('pdf');
  });

  it('maps .md and .mdx to markdown', () => {
    expect(detectSourceType('note.md')).toBe('markdown');
    expect(detectSourceType('page.mdx')).toBe('markdown');
  });

  it('maps .html and .htm to html', () => {
    expect(detectSourceType('index.html')).toBe('html');
    expect(detectSourceType('page.htm')).toBe('html');
  });

  it('maps unknown extensions to text', () => {
    expect(detectSourceType('file.csv')).toBe('text');
    expect(detectSourceType('file.rs')).toBe('text');
    expect(detectSourceType('file')).toBe('text');
  });
});

describe('slugify', () => {
  it('lowercases and preserves the extension', () => {
    expect(slugify('MyFile.PDF')).toBe('myfile.pdf');
  });

  it('replaces spaces with hyphens', () => {
    expect(slugify('my file.txt')).toBe('my-file.txt');
  });

  it('replaces underscores with hyphens', () => {
    expect(slugify('my_file.txt')).toBe('my-file.txt');
  });

  it('strips non-alphanumeric characters from the stem', () => {
    expect(slugify('hello! world?.txt')).toBe('hello-world.txt');
  });

  it('collapses multiple hyphens into one', () => {
    expect(slugify('my--file.txt')).toBe('my-file.txt');
  });

  it('trims leading and trailing hyphens from the stem', () => {
    expect(slugify('-leading.txt')).toBe('leading.txt');
    expect(slugify('trailing-.txt')).toBe('trailing.txt');
  });
});
