/**
 * Citation verification for the `ico ask` pipeline (E7-B04).
 *
 * Checks that each citation produced by the answer generator refers to a
 * compiled page that actually exists in the workspace wiki directory.
 * Builds a provenance chain from answer → compiled page → raw source
 * (via YAML frontmatter `source_path` field).
 *
 * Never throws — all error paths return err(Error).
 */

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ok, type Result } from '@ico/types';

import type { Citation } from './generate.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** A single step in the provenance chain from answer to raw source. */
export interface ProvenanceEntry {
  /** Semantic layer label. */
  level: 'answer' | 'compiled-page' | 'source-summary' | 'raw-source';
  /** Filesystem path for this entry (absolute or relative to workspace root). */
  path: string;
  /** Human-readable title for display. */
  title: string;
}

/** Result of verifying all citations from a generated answer. */
export interface VerificationResult {
  /** Citations whose referenced page exists on disk. */
  verified: Citation[];
  /** Citations whose referenced page could not be found (hallucinated references). */
  unverified: Citation[];
  /** Provenance chain assembled from verified citation pages. */
  provenanceChain: ProvenanceEntry[];
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Simple YAML frontmatter parser — extracts `key: value` pairs from the
 * first `---…---` block of a markdown file.
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
 * Attempt to resolve the path of a cited page within the workspace wiki
 * directory.
 *
 * `citation.pagePath` is a path relative to `wiki/` (e.g.
 * `concepts/self-attention.md`). If it is empty (citation was unresolved
 * during generation), we return `null`.
 */
function resolvePagePath(workspacePath: string, citation: Citation): string | null {
  if (citation.pagePath === '') {
    return null;
  }
  const abs = join(workspacePath, 'wiki', citation.pagePath);
  return existsSync(abs) ? abs : null;
}

/**
 * Read a wiki page and extract provenance information from its frontmatter.
 *
 * Returns `null` when the file cannot be read.
 */
function readPageProvenance(
  absPagePath: string,
): { sourcePath: string | null; title: string } | null {
  let content: string;
  try {
    content = readFileSync(absPagePath, 'utf-8');
  } catch {
    return null;
  }

  const fm = parseFrontmatter(content);
  const title = fm['title'] ?? absPagePath;
  // `source_path` is stored relative to the workspace root in frontmatter
  const sourcePath = fm['source_path'] ?? null;

  return { sourcePath, title };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Verify that each citation refers to a real compiled page, and build a
 * provenance chain from the verified citations.
 *
 * @param workspacePath - Absolute path to the workspace root.
 * @param citations     - Citations extracted by {@link generateAnswer}.
 * @returns `ok(VerificationResult)` always — verification is non-fatal.
 *          The `unverified` array captures hallucinated references.
 */
export function verifyCitations(
  workspacePath: string,
  citations: Citation[],
): Result<VerificationResult, Error> {
  const verified: Citation[] = [];
  const unverified: Citation[] = [];
  const provenanceChain: ProvenanceEntry[] = [];

  // The chain always begins at the answer layer.
  provenanceChain.push({
    level: 'answer',
    path: '(generated answer)',
    title: 'Generated Answer',
  });

  for (const citation of citations) {
    const absPath = resolvePagePath(workspacePath, citation);

    if (absPath === null) {
      unverified.push(citation);
      continue;
    }

    verified.push(citation);

    // Add the compiled-page layer to the provenance chain (deduplicated by path).
    const alreadyInChain = provenanceChain.some(
      (e) => e.level === 'compiled-page' && e.path === citation.pagePath,
    );

    if (!alreadyInChain) {
      provenanceChain.push({
        level: 'compiled-page',
        path: citation.pagePath,
        title: citation.pageTitle,
      });

      // Attempt to trace further back to the raw source via frontmatter.
      const provenance = readPageProvenance(absPath);

      if (provenance !== null && provenance.sourcePath !== null) {
        provenanceChain.push({
          level: 'raw-source',
          path: provenance.sourcePath,
          title: provenance.sourcePath,
        });
      }
    }
  }

  return ok({ verified, unverified, provenanceChain });
}
