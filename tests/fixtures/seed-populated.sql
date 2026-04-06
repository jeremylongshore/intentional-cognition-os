-- Seed data for the populated fixture workspace

INSERT INTO sources (id, path, type, title, author, ingested_at, word_count, hash, metadata)
VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'raw/articles/sample-article.md', 'markdown', 'The Role of Knowledge Compilation in Modern AI Systems', NULL, '2026-04-01T10:00:00Z', 250, 'sha256:abc123def456', NULL),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'raw/papers/sample-paper.md', 'markdown', 'Deterministic Control Planes for AI Agent Systems', 'A. Researcher, B. Scientist', '2026-04-01T10:05:00Z', 300, 'sha256:def456ghi789', '{"journal":"Agent Architecture Workshop"}'),
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'raw/notes/sample-notes.md', 'markdown', 'Research Notes: Episodic Task Workspaces', NULL, '2026-04-01T10:10:00Z', 200, 'sha256:ghi789jkl012', NULL);

INSERT INTO mounts (id, name, path, created_at, last_indexed_at)
VALUES
  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'test-corpus', '/tmp/ico-test-corpus', '2026-04-01T09:00:00Z', '2026-04-01T10:10:00Z');
