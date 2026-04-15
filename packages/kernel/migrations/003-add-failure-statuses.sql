-- Migration: 003-add-failure-statuses
-- Description: Expand tasks.status CHECK constraint to include four
--              recoverable failure states used by the research orchestrator
--              (E9-B06): failed_collecting, failed_synthesizing,
--              failed_critiquing, failed_rendering.
--
--              SQLite does not support ALTER COLUMN on CHECK constraints, so
--              this migration rewrites the tasks table: create a new table
--              with the expanded constraint, copy rows, drop the old one,
--              rename. Indexes are rebuilt after the rename. No data loss.
-- Date: 2026-04-15

-- === UP ===
CREATE TABLE tasks_new (
    id              TEXT    PRIMARY KEY,
    brief           TEXT    NOT NULL,
    status          TEXT    NOT NULL DEFAULT 'created' CHECK (status IN (
                                'created', 'collecting', 'synthesizing',
                                'critiquing', 'rendering', 'completed', 'archived',
                                'failed_collecting', 'failed_synthesizing',
                                'failed_critiquing', 'failed_rendering'
                            )),
    created_at      TEXT    NOT NULL,
    updated_at      TEXT    NOT NULL,
    completed_at    TEXT,
    archived_at     TEXT,
    workspace_path  TEXT    NOT NULL
);

INSERT INTO tasks_new (id, brief, status, created_at, updated_at, completed_at, archived_at, workspace_path)
    SELECT id, brief, status, created_at, updated_at, completed_at, archived_at, workspace_path
    FROM tasks;

DROP INDEX IF EXISTS idx_tasks_status;
DROP INDEX IF EXISTS idx_tasks_created_at;
DROP TABLE tasks;
ALTER TABLE tasks_new RENAME TO tasks;

CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);

-- === DOWN ===
-- Narrowing the CHECK back would require migrating any failure-state rows
-- to a legal value first. Intentionally no-op: rolling back this migration
-- on a populated database would silently discard state. Restore from a
-- pre-migration backup instead.
