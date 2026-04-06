import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { rebuildWikiIndex } from './wiki-index.js';

/** Wiki subdirectory names that get scanned. */
const WIKI_DIRS = [
  'sources',
  'concepts',
  'entities',
  'topics',
  'contradictions',
  'open-questions',
  'indexes',
];

/**
 * Build a temporary workspace with the full wiki directory tree.
 * Returns the workspace root path.
 */
function makeTempWorkspace(): string {
  const root = mkdtempSync(join(tmpdir(), 'ico-wiki-test-'));
  const wikiPath = resolve(root, 'wiki');
  for (const dir of WIKI_DIRS) {
    mkdirSync(resolve(wikiPath, dir), { recursive: true });
  }
  return root;
}

/**
 * Write a minimal compiled markdown page with YAML frontmatter.
 */
function writeFixturePage(
  workspacePath: string,
  subdir: string,
  filename: string,
  type: string,
  title: string,
): void {
  const filePath = resolve(workspacePath, 'wiki', subdir, filename);
  const content = [
    '---',
    `type: ${type}`,
    `title: ${title}`,
    `id: 00000000-0000-0000-0000-000000000001`,
    `compiled_at: 2026-01-01T00:00:00.000Z`,
    `model: claude-sonnet-4-6`,
    '---',
    '',
    `# ${title}`,
    '',
    'Body content here.',
    '',
  ].join('\n');
  writeFileSync(filePath, content, 'utf-8');
}

describe('rebuildWikiIndex', () => {
  let workspacePath: string;

  beforeEach(() => {
    workspacePath = makeTempWorkspace();
  });

  afterEach(() => {
    rmSync(workspacePath, { recursive: true, force: true });
  });

  it('empty wiki — writes index with "No compiled pages yet" and page_count 0', () => {
    const result = rebuildWikiIndex(workspacePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toBe(0);

    const indexPath = resolve(workspacePath, 'wiki', 'index.md');
    expect(existsSync(indexPath)).toBe(true);

    const content = readFileSync(indexPath, 'utf-8');
    expect(content).toContain('type: index');
    expect(content).toContain('title: Knowledge Index');
    expect(content).toContain('page_count: 0');
    expect(content).toContain('_No compiled pages yet._');
  });

  it('3 fixture pages — index lists all categorized correctly', () => {
    writeFixturePage(workspacePath, 'sources', 'my-source.md', 'source-summary', 'My Source');
    writeFixturePage(workspacePath, 'concepts', 'my-concept.md', 'concept', 'My Concept');
    writeFixturePage(workspacePath, 'topics', 'my-topic.md', 'topic', 'My Topic');

    const result = rebuildWikiIndex(workspacePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toBe(3);

    const content = readFileSync(resolve(workspacePath, 'wiki', 'index.md'), 'utf-8');

    // Frontmatter
    expect(content).toContain('page_count: 3');

    // Section headings with counts
    expect(content).toContain('## Sources (1)');
    expect(content).toContain('## Concepts (1)');
    expect(content).toContain('## Topics (1)');
    expect(content).toContain('## Entities (0)');
    expect(content).toContain('## Contradictions (0)');
    expect(content).toContain('## Open Questions (0)');

    // Links
    expect(content).toContain('[My Source](sources/my-source.md)');
    expect(content).toContain('[My Concept](concepts/my-concept.md)');
    expect(content).toContain('[My Topic](topics/my-topic.md)');
  });

  it('adding a 4th page — re-running includes the new file in the index', () => {
    writeFixturePage(workspacePath, 'sources', 'source-a.md', 'source-summary', 'Source A');
    writeFixturePage(workspacePath, 'concepts', 'concept-a.md', 'concept', 'Concept A');
    writeFixturePage(workspacePath, 'topics', 'topic-a.md', 'topic', 'Topic A');

    const first = rebuildWikiIndex(workspacePath);
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.value).toBe(3);

    // Add a 4th page and rebuild
    writeFixturePage(workspacePath, 'entities', 'entity-a.md', 'entity', 'Entity A');

    const second = rebuildWikiIndex(workspacePath);
    expect(second.ok).toBe(true);
    if (!second.ok) return;

    expect(second.value).toBe(4);

    const content = readFileSync(resolve(workspacePath, 'wiki', 'index.md'), 'utf-8');
    expect(content).toContain('page_count: 4');
    expect(content).toContain('## Entities (1)');
    expect(content).toContain('[Entity A](entities/entity-a.md)');
  });

  it('no .tmp file remains after a successful rebuild', () => {
    writeFixturePage(workspacePath, 'sources', 'src.md', 'source-summary', 'My Source');

    const result = rebuildWikiIndex(workspacePath);
    expect(result.ok).toBe(true);

    const tmpPath = resolve(workspacePath, 'wiki', 'index.md.tmp');
    expect(existsSync(tmpPath)).toBe(false);
  });

  it('index.md exists and is valid YAML frontmatter after rebuild (no corruption)', () => {
    writeFixturePage(workspacePath, 'concepts', 'c.md', 'concept', 'Alpha Concept');

    const result = rebuildWikiIndex(workspacePath);
    expect(result.ok).toBe(true);

    const indexPath = resolve(workspacePath, 'wiki', 'index.md');
    expect(existsSync(indexPath)).toBe(true);

    const content = readFileSync(indexPath, 'utf-8');

    // Must start with a YAML frontmatter block
    expect(content.startsWith('---\n')).toBe(true);

    // Frontmatter closes before the body begins
    const secondDelimiter = content.indexOf('\n---', 4);
    expect(secondDelimiter).toBeGreaterThan(0);

    // generated_at must be a valid ISO 8601 timestamp
    const match = content.match(/generated_at:\s*(.+)/);
    expect(match).not.toBeNull();
    const ts = match?.[1]?.trim();
    expect(ts).toBeDefined();
    if (ts == null) return;
    expect(new Date(ts).toISOString()).toBe(ts);
  });

  it('return value equals the correct total page count', () => {
    writeFixturePage(workspacePath, 'sources', 's1.md', 'source-summary', 'S1');
    writeFixturePage(workspacePath, 'sources', 's2.md', 'source-summary', 'S2');
    writeFixturePage(workspacePath, 'concepts', 'c1.md', 'concept', 'C1');
    writeFixturePage(workspacePath, 'contradictions', 'x1.md', 'contradiction', 'X1');
    writeFixturePage(workspacePath, 'open-questions', 'q1.md', 'open-question', 'Q1');

    const result = rebuildWikiIndex(workspacePath);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.value).toBe(5);

    const content = readFileSync(resolve(workspacePath, 'wiki', 'index.md'), 'utf-8');
    expect(content).toContain('page_count: 5');
    expect(content).toContain('## Sources (2)');
    expect(content).toContain('## Concepts (1)');
    expect(content).toContain('## Contradictions (1)');
    expect(content).toContain('## Open Questions (1)');
  });
});
