-- ICO Test Fixture Database Schema
-- Matches 010-AT-DBSC database schema specification

PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  mount_id TEXT REFERENCES mounts(id),
  type TEXT NOT NULL CHECK (type IN ('pdf', 'markdown', 'html', 'text')),
  title TEXT,
  author TEXT,
  ingested_at TEXT NOT NULL,
  word_count INTEGER,
  hash TEXT NOT NULL,
  metadata TEXT,
  UNIQUE (path, hash)
);

CREATE TABLE IF NOT EXISTS mounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  path TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_indexed_at TEXT
);

CREATE TABLE IF NOT EXISTS compilations (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id),
  type TEXT NOT NULL CHECK (type IN ('summary', 'concept', 'topic', 'entity', 'contradiction', 'open-question')),
  output_path TEXT NOT NULL,
  compiled_at TEXT NOT NULL,
  stale INTEGER NOT NULL DEFAULT 0 CHECK (stale IN (0, 1)),
  model TEXT NOT NULL,
  tokens_used INTEGER,
  UNIQUE (source_id, type, output_path)
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  brief TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created', 'collecting', 'synthesizing', 'critiquing', 'rendering', 'completed', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  archived_at TEXT,
  workspace_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'concept', 'entity', 'reference')),
  promoted_at TEXT NOT NULL,
  promoted_by TEXT NOT NULL CHECK (promoted_by IN ('user', 'system'))
);

CREATE TABLE IF NOT EXISTS recall_results (
  id TEXT PRIMARY KEY,
  concept TEXT NOT NULL,
  topic TEXT,
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  tested_at TEXT NOT NULL,
  confidence REAL CHECK (confidence >= 0.0 AND confidence <= 1.0),
  source_card TEXT
);

CREATE TABLE IF NOT EXISTS traces (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  correlation_id TEXT,
  timestamp TEXT NOT NULL,
  file_path TEXT NOT NULL,
  line_offset INTEGER NOT NULL,
  summary TEXT
);

CREATE TABLE IF NOT EXISTS compilation_sources (
  compilation_id TEXT NOT NULL REFERENCES compilations(id) ON DELETE CASCADE,
  source_id TEXT NOT NULL REFERENCES sources(id),
  PRIMARY KEY (compilation_id, source_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sources_hash ON sources(hash);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
CREATE INDEX IF NOT EXISTS idx_sources_mount_id ON sources(mount_id);
CREATE INDEX IF NOT EXISTS idx_compilations_source_id ON compilations(source_id);
CREATE INDEX IF NOT EXISTS idx_compilations_type ON compilations(type);
CREATE INDEX IF NOT EXISTS idx_compilations_stale ON compilations(stale) WHERE stale = 1;
CREATE INDEX IF NOT EXISTS idx_compilations_output_path ON compilations(output_path);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_recall_results_concept ON recall_results(concept);
CREATE INDEX IF NOT EXISTS idx_recall_results_tested_at ON recall_results(tested_at);
CREATE INDEX IF NOT EXISTS idx_traces_event_type ON traces(event_type);
CREATE INDEX IF NOT EXISTS idx_traces_correlation_id ON traces(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_traces_timestamp ON traces(timestamp);
CREATE INDEX IF NOT EXISTS idx_compilation_sources_source_id ON compilation_sources(source_id);
