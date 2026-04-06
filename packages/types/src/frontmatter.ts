import { z } from 'zod';

// --- Compiled Page Types ---

export const CompiledPageTypeSchema = z.enum([
  'source-summary',
  'concept',
  'topic',
  'entity',
  'contradiction',
  'open-question',
  'semantic-index',
]);

export type CompiledPageType = z.infer<typeof CompiledPageTypeSchema>;

// --- Entity Types ---

export const EntityTypeSchema = z.enum([
  'person',
  'organization',
  'tool',
  'framework',
  'dataset',
  'other',
]);

export type EntityType = z.infer<typeof EntityTypeSchema>;

// --- Source Summary Frontmatter ---

export const SourceSummaryFrontmatterSchema = z.object({
  type: z.literal('source-summary'),
  id: z.string().uuid(),
  title: z.string(),
  source_id: z.string().uuid(),
  source_path: z.string(),
  compiled_at: z.string().datetime(),
  model: z.string(),
  content_hash: z.string(),
  author: z.string().optional(),
  publication_date: z.string().optional(),
  word_count: z.number().int().nonnegative().optional(),
  key_claims: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type SourceSummaryFrontmatter = z.infer<typeof SourceSummaryFrontmatterSchema>;

// --- Concept Frontmatter ---

export const ConceptFrontmatterSchema = z.object({
  type: z.literal('concept'),
  id: z.string().uuid(),
  title: z.string(),
  definition: z.string(),
  source_ids: z.array(z.string().uuid()),
  compiled_at: z.string().datetime(),
  model: z.string(),
  aliases: z.array(z.string()).optional(),
  related_concepts: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type ConceptFrontmatter = z.infer<typeof ConceptFrontmatterSchema>;

// --- Topic Frontmatter ---

export const TopicFrontmatterSchema = z.object({
  type: z.literal('topic'),
  id: z.string().uuid(),
  title: z.string(),
  source_ids: z.array(z.string().uuid()),
  compiled_at: z.string().datetime(),
  model: z.string(),
  subtopics: z.array(z.string()).optional(),
  key_findings: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type TopicFrontmatter = z.infer<typeof TopicFrontmatterSchema>;

// --- Entity Frontmatter ---

export const EntityFrontmatterSchema = z.object({
  type: z.literal('entity'),
  id: z.string().uuid(),
  title: z.string(),
  entity_type: EntityTypeSchema,
  source_ids: z.array(z.string().uuid()),
  compiled_at: z.string().datetime(),
  model: z.string(),
  aliases: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  related_entities: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

export type EntityFrontmatter = z.infer<typeof EntityFrontmatterSchema>;

// --- Contradiction Frontmatter ---

export const ContradictionFrontmatterSchema = z.object({
  type: z.literal('contradiction'),
  id: z.string().uuid(),
  title: z.string(),
  claim_a: z.string(),
  claim_b: z.string(),
  source_a_id: z.string().uuid(),
  source_b_id: z.string().uuid(),
  compiled_at: z.string().datetime(),
  model: z.string(),
  resolution: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
});

export type ContradictionFrontmatter = z.infer<typeof ContradictionFrontmatterSchema>;

// --- Open Question Frontmatter ---

export const OpenQuestionFrontmatterSchema = z.object({
  type: z.literal('open-question'),
  id: z.string().uuid(),
  title: z.string(),
  question: z.string(),
  compiled_at: z.string().datetime(),
  model: z.string(),
  context: z.string().optional(),
  related_concepts: z.array(z.string()).optional(),
  suggested_sources: z.array(z.string()).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  tags: z.array(z.string()).optional(),
});

export type OpenQuestionFrontmatter = z.infer<typeof OpenQuestionFrontmatterSchema>;
