# Architecture: intentional-cognition-os

> Compile knowledge for the machine. Distill understanding for the human.

**Author:** Jeremy Longshore
**Date:** 2026-04-02
**Status:** Draft

## System Context

Intentional Cognition OS is a local-first knowledge operating system with optional remote capabilities. It operates on the user's filesystem, using SQLite for deterministic state and JSONL for traces.

## Six-Layer Architecture

| Layer | Responsibility | Storage |
|-------|---------------|---------|
| 1. Raw Corpus | Source-of-truth inputs (PDFs, articles, repos, notes) | `workspace/raw/` |
| 2. Semantic Knowledge | Compiled markdown (summaries, concepts, entities, backlinks) | `workspace/wiki/` |
| 3. Episodic Task | Temporary research workspaces for complex questions | `workspace/tasks/` |
| 4. Artifact | Durable outputs (reports, slides, charts, briefings) | `workspace/outputs/` |
| 5. Recall | Human retention (flashcards, quizzes, spaced repetition) | `workspace/recall/` |
| 6. Audit & Policy | Deterministic control (traces, provenance, approvals) | `workspace/audit/` |

## Component Design

| Component | Responsibility |
|-----------|---------------|
| `cli/` | CLI entry point (`ico`/`intent`), command routing |
| `kernel/` | Core runtime, workspace management, mount table |
| `compiler/` | Knowledge compilation (summarize, extract, link, diff) |
| `mounts/` | Corpus mount points for raw source material |
| `evals/` | Quality evaluation specs |
| `apps/` | Optional web UI (later) |

## Data Flow

```
[Raw Sources] → [Ingest] → [Raw Corpus Layer]
                                    ↓
                            [Compile] → [Semantic Knowledge Layer]
                                    ↓
                    [Ask/Research] → [Episodic Task Layer]
                                    ↓
                           [Render] → [Artifact Layer]
                                    ↓
                          [Promote] → filed back into system
                                    ↓
                           [Recall] → [Recall Layer]
                                    ↓
                            [Audit] → [Audit & Policy Layer]
```

## Deterministic vs Probabilistic Boundary

| Side | Owns |
|------|------|
| **Deterministic** | File storage, task state, mount table, provenance, policy, audit, permissions, promotion rules, eval execution |
| **Probabilistic** | Summarization, synthesis, drafting, contradiction suggestions, question decomposition, recall generation, artifact writing |

## Multi-Agent Pattern (Complex Tasks)

For hard questions, the system creates a temporary research workspace:
1. Create scoped workspace
2. Assign collectors (gather evidence)
3. Assign summarizers (distill findings)
4. Assign skeptics (challenge conclusions)
5. Assign integrators (synthesize final answer)
6. Generate final artifact
7. Optionally generate recall artifacts
8. Promote only durable outputs

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Runtime | TypeScript, Node.js 22+ |
| CLI | Commander.js |
| State | SQLite (better-sqlite3) |
| Traces | JSONL |
| Retrieval | Markdown-first, optional embeddings |
| Workers | Python (parsing, plotting, document processing) |
| Output | Markdown, Marp, matplotlib |
| AI | Claude API (Agent SDK for orchestration) |
| Frontend | Filesystem-compatible with Obsidian, optional web UI later |

## Security Model

- **Authentication:** Local-only (no auth needed for local mode)
- **Data Classification:** User-controlled, all local by default
- **Secrets Management:** .env for API keys only
- **Provenance:** Every derived artifact traces to source
