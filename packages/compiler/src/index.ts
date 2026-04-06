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
export {
  calculateCost,
  getTokenUsageSummary,
  formatTokenUsage,
  type TokenUsageSummary,
  type ModelPricing,
  MODEL_PRICING,
} from './token-tracker.js';
export {
  summarizeSource,
  type SummarizeOptions,
  type SummarizeResult,
} from './passes/summarize.js';
export {
  extractConcepts,
  type ExtractOptions,
  type ExtractResult,
} from './passes/extract.js';
export {
  synthesizeTopics,
  type SynthesizeOptions,
  type SynthesizeResult,
} from './passes/synthesize.js';
export {
  addBacklinks,
  type LinkOptions,
  type LinkResult,
} from './passes/link.js';
export {
  detectContradictions,
  type ContradictOptions,
  type ContradictResult,
} from './passes/contradict.js';
export {
  identifyGaps,
  type GapOptions,
  type GapResult,
} from './passes/gap.js';
