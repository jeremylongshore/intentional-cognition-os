-- ICO Test Fixture Database Schema
-- Matches 010-AT-DBSC database schema specification

PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  path TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pdf', 'markdown', 'html', 'text')),
  title TEXT,
  author TEXT,
  ingested_at TEXT NOT NULL,
  word_count INTEGER,
  hash TEXT NOT NULL,
  metadata TEXT
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
  model TEXT NOT NULL,
  tokens_used INTEGER
);

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  brief TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('created', 'collecting', 'synthesizing', 'critiquing', 'rendering', 'completed', 'archived')),
  created_at TEXT NOT NULL,
  completed_at TEXT,
  workspace_path TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('topic', 'concept', 'entity', 'reference')),
  promoted_at TEXT NOT NULL,
  promoted_by TEXT NOT NULL CHECK (promoted_by IN ('user')),
  source_hash TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS recall_results (
  id TEXT PRIMARY KEY,
  concept TEXT NOT NULL,
  correct INTEGER NOT NULL CHECK (correct IN (0, 1)),
  tested_at TEXT NOT NULL,
  confidence REAL
);

CREATE TABLE IF NOT EXISTS traces (
  id TEXT PRIMARY KEY,
  file_path TEXT NOT NULL,
  byte_offset INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  event_id TEXT NOT NULL,
  correlation_id TEXT,
  timestamp TEXT NOT NULL,
  prev_hash TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sources_hash ON sources(hash);
CREATE INDEX IF NOT EXISTS idx_sources_type ON sources(type);
CREATE INDEX IF NOT EXISTS idx_compilations_source ON compilations(source_id);
CREATE INDEX IF NOT EXISTS idx_compilations_type ON compilations(type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_traces_event_type ON traces(event_type);
CREATE INDEX IF NOT EXISTS idx_traces_correlation ON traces(correlation_id);
