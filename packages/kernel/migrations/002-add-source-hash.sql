-- Migration: 002-add-source-hash
-- Description: Add source_hash column to promotions table
-- Date: 2026-04-06

-- === UP ===
ALTER TABLE promotions ADD COLUMN source_hash TEXT;

-- === DOWN ===
-- SQLite doesn't support DROP COLUMN, so this is a no-op comment
