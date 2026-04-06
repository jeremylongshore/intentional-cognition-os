/**
 * Shared types for all ingest adapters.
 *
 * Each adapter converts a raw source file into an {@link IngestResult},
 * providing normalised text content alongside a metadata envelope.
 */

/** Normalised metadata extracted from a source document. */
export interface IngestMetadata {
  /** Document title from frontmatter, a heading, or null when absent. */
  title: string | null;
  /** Author from frontmatter, or null. */
  author: string | null;
  /** ISO date string from frontmatter, or null. */
  date: string | null;
  /** Tag array, empty when none defined. */
  tags: string[];
  /** Word count of the body content (post-frontmatter). */
  wordCount: number;
  /** Page count — meaningful for PDF sources. */
  pageCount?: number;
  /** Canonical URL if the document originated from the web. */
  sourceUrl?: string;
  /** Any additional frontmatter fields the adapter surfaces. */
  [key: string]: unknown;
}

/** The normalised output produced by every ingest adapter. */
export interface IngestResult {
  /** Extracted body text, stripped of adapter-specific markup/frontmatter. */
  content: string;
  /** Structured metadata envelope. */
  metadata: IngestMetadata;
  /** Discriminator identifying which adapter produced this result. */
  sourceType: 'markdown' | 'pdf' | 'html' | 'text';
}
