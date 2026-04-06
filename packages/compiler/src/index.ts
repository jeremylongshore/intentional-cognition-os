export { version } from './version.js';
export { detectSourceType, ingestSource, type SourceType } from './adapters/registry.js';
export type { IngestResult, IngestMetadata } from './adapters/types.js';
export {
  runIngestPipeline,
  type IngestPipelineOptions,
  type IngestPipelineResult,
} from './ingest-pipeline.js';
export {
  validateCompiledPage,
  validateFrontmatter,
  type ValidationResult,
} from './validation.js';
export {
  detectStalePages,
  markStale,
  getUncompiledSources,
  type StalePageInfo,
} from './staleness.js';
export {
  createClaudeClient,
  estimateTokens,
  sanitizeForPrompt,
  type ClaudeClient,
  type CompletionOptions,
  type CompletionResult,
} from './api/claude-client.js';
