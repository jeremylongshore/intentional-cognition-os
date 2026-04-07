/**
 * Tests for artifact frontmatter validation (E8-B06).
 *
 * All tests use temporary directories — no network calls are made.
 */

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { validateAllArtifacts, validateArtifact } from './artifact-meta.js';

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'ico-artifact-meta-test-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** Write a file to `tmpDir/<name>` after ensuring parent dirs exist. */
function writeFixture(relativePath: string, content: string): string {
  const absolutePath = join(tmpDir, relativePath);
  mkdirSync(join(absolutePath, '..'), { recursive: true });
  writeFileSync(absolutePath, content, 'utf-8');
  return absolutePath;
}

const VALID_REPORT_MD = `---
type: report
title: "My Report"
generated_at: "2024-01-15T10:00:00.000Z"
generated_from:
  - "wiki/topics/foo.md"
source_pages:
  - "foo.md"
model: "claude-sonnet-4-6"
tokens_used: 300
---

## Executive Summary

Content here.
`;

const VALID_SLIDES_MD = `---
marp: true
type: slides
title: "My Slides"
generated_at: "2024-01-15T10:00:00.000Z"
generated_from:
  - "wiki/topics/bar.md"
source_pages:
  - "bar.md"
model: "claude-sonnet-4-6"
tokens_used: 450
---

# Title Slide
`;

// ---------------------------------------------------------------------------
// validateArtifact — valid files
// ---------------------------------------------------------------------------

describe('validateArtifact — valid report', () => {
  it('returns valid: true for a complete report frontmatter', () => {
    const filePath = writeFixture('report.md', VALID_REPORT_MD);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(true);
    expect(result.value.errors).toHaveLength(0);
  });

  it('parses frontmatter fields correctly for a report', () => {
    const filePath = writeFixture('report.md', VALID_REPORT_MD);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const fm = result.value.frontmatter;
    expect(fm.type).toBe('report');
    expect(fm.title).toBe('My Report');
    expect(fm.model).toBe('claude-sonnet-4-6');
    expect(fm.tokens_used).toBe(300);
  });
});

describe('validateArtifact — valid slides', () => {
  it('returns valid: true for a complete slides frontmatter with marp: true', () => {
    const filePath = writeFixture('slides.md', VALID_SLIDES_MD);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(true);
    expect(result.value.errors).toHaveLength(0);
  });

  it('returns valid: false for slides missing marp: true', () => {
    const noMarp = VALID_SLIDES_MD.replace('marp: true\n', '');
    const filePath = writeFixture('no-marp.md', noMarp);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(false);
    expect(result.value.errors.some((e) => e.includes('marp'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateArtifact — missing required fields
// ---------------------------------------------------------------------------

describe('validateArtifact — missing required fields', () => {
  it('returns error for missing title', () => {
    const md = VALID_REPORT_MD.replace('title: "My Report"\n', '');
    const filePath = writeFixture('missing-title.md', md);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(false);
    expect(result.value.errors.some((e) => e.includes('title'))).toBe(true);
  });

  it('returns error for missing generated_at', () => {
    const md = VALID_REPORT_MD.replace('generated_at: "2024-01-15T10:00:00.000Z"\n', '');
    const filePath = writeFixture('missing-generated-at.md', md);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(false);
    expect(result.value.errors.some((e) => e.includes('generated_at'))).toBe(true);
  });

  it('returns error for missing model', () => {
    const md = VALID_REPORT_MD.replace('model: "claude-sonnet-4-6"\n', '');
    const filePath = writeFixture('missing-model.md', md);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(false);
    expect(result.value.errors.some((e) => e.includes('model'))).toBe(true);
  });

  it('returns multiple errors for multiple missing fields', () => {
    const md = `---
type: report
generated_from:
  - "wiki/topics/foo.md"
tokens_used: 100
---
Body.
`;
    const filePath = writeFixture('missing-many.md', md);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.valid).toBe(false);
    // title, generated_at, and model are all missing
    expect(result.value.errors.length).toBeGreaterThanOrEqual(3);
  });

  it('returns a warning for missing optional source_pages field', () => {
    const md = VALID_REPORT_MD.replace('source_pages:\n  - "foo.md"\n', '');
    const filePath = writeFixture('missing-source-pages.md', md);
    const result = validateArtifact(filePath);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    // source_pages is optional so no error, but a warning is expected
    expect(result.value.valid).toBe(true);
    expect(result.value.warnings.some((w) => w.includes('source_pages'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateArtifact — file not found
// ---------------------------------------------------------------------------

describe('validateArtifact — file not found', () => {
  it('returns err when the file does not exist', () => {
    const result = validateArtifact('/nonexistent/path/report.md');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error.message).toContain('not found');
  });
});

// ---------------------------------------------------------------------------
// validateAllArtifacts
// ---------------------------------------------------------------------------

describe('validateAllArtifacts', () => {
  it('returns empty array when outputs directories do not exist', () => {
    const result = validateAllArtifacts(tmpDir);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(0);
  });

  it('returns validation results for reports and slides', () => {
    writeFixture('outputs/reports/report.md', VALID_REPORT_MD);
    writeFixture('outputs/slides/slides.md', VALID_SLIDES_MD);

    const result = validateAllArtifacts(tmpDir);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(2);
  });

  it('returns mixed valid/invalid results for mixed files', () => {
    const badMd = `---
type: report
---
Missing most fields.
`;
    writeFixture('outputs/reports/good.md', VALID_REPORT_MD);
    writeFixture('outputs/reports/bad.md', badMd);

    const result = validateAllArtifacts(tmpDir);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(2);

    const validCount = result.value.filter((v) => v.valid).length;
    const invalidCount = result.value.filter((v) => !v.valid).length;
    expect(validCount).toBe(1);
    expect(invalidCount).toBe(1);
  });

  it('scans subdirectories recursively', () => {
    writeFixture('outputs/reports/sub/nested.md', VALID_REPORT_MD);

    const result = validateAllArtifacts(tmpDir);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
    expect(result.value[0]!.valid).toBe(true);
  });

  it('ignores non-.md files', () => {
    writeFixture('outputs/reports/data.json', '{"not": "markdown"}');
    writeFixture('outputs/reports/report.md', VALID_REPORT_MD);

    const result = validateAllArtifacts(tmpDir);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value).toHaveLength(1);
  });
});
