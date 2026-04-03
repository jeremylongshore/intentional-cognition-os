# Intentional Cognition OS — Master Blueprint

> Compile knowledge for the machine. Distill understanding for the human.

**Author:** Jeremy Longshore
**Date:** 2026-04-02
**Status:** Brainstorming Blueprint

## 1. Core Idea

Build a knowledge operating system that turns raw source material into maintained semantic knowledge, then uses that knowledge to:
- Answer complex questions
- Generate durable artifacts
- Run scoped research workflows
- Lint and improve its own knowledge base
- Strengthen human understanding through recall loops

This is **not**: chat with docs, a note-taking app, a wiki generator, a generic agent shell, or "RAG but cooler."

This **is**: a system where source material is ingested, compiled into structured knowledge, queried through research workspaces, rendered into durable artifacts, filed back, and refined — with recall/testing layers to help the human retain what matters.

## 2. Product Shape

Three modes under one identity:

| Mode | Use Cases |
|------|-----------|
| **Local** | Personal research vault, project knowledge base, private analysis, offline workflows |
| **Remote** | Team knowledge system, shared research, remote indexing, permissioned org memory |
| **Repo-native** | Source-controlled knowledge, agent instructions, durable outputs, auditable research |

## 3. Core Thesis

The real product is a cognition runtime with five key behaviors:
1. Ingest raw sources
2. Compile semantic knowledge from those sources
3. Reason over that knowledge using agents and tools
4. Render durable artifacts from the results
5. Refine both machine memory and human understanding over time

## 4. Big Differentiators

- **Knowledge compilation** — Not just indexing. Derives summaries, concept pages, entity pages, backlinks, contradictions, open questions.
- **Semantic filesystem** — Knowledge feels mounted and operable, not hidden in a blob.
- **Ephemeral research workspaces** — Hard questions create temporary task environments.
- **Recall-aware cognition** — Helps the human remember, not just the model retrieve.
- **Local + remote symmetry** — Same concepts exist locally and remotely.

## 5. Six-Layer Architecture

1. **Raw Corpus Layer** — Source-of-truth inputs (preserve integrity and provenance)
2. **Semantic Knowledge Layer** — Compiled markdown knowledge (reduce reasoning cost, inspectable)
3. **Episodic Task Layer** — Temporary research workspaces (structured working memory)
4. **Artifact Layer** — Durable outputs (make exploration cumulative)
5. **Recall Layer** — Human retention support (test understanding, identify weak spots)
6. **Audit & Policy Layer** — Deterministic control plane (trust, inspectability, replayable)

## 6. Deterministic vs Probabilistic Boundary

**Deterministic** owns: file storage, task state, mount table, provenance, policy, audit, permissions, promotion rules, eval execution.

**Probabilistic** owns: summarization, synthesis, drafting, contradiction suggestions, question decomposition, recall generation, artifact writing.

## 7. Multi-Agent Pattern

For complex tasks:
1. Create temporary research workspace
2. Assign collectors, summarizers, skeptics, integrators
3. Generate final artifact
4. Optionally generate recall artifacts
5. Promote only durable outputs

## 8. CLI Shape

```bash
ico ingest ./sources
ico mount ./workspace/raw
ico compile topic "agent memory"
ico ask "Compare semantic memory vs episodic task memory"
ico research "Build a briefing on ERC-8004 trust signals"
ico render report --task latest
ico render slides --task latest
ico lint knowledge
ico recall generate --topic "intent systems"
ico eval run
```

## 9. Workspace Shape

```
intentional-cognition-os/
├── 000-docs/
├── .claude/
├── cli/
├── kernel/
├── compiler/
├── mounts/
├── workspace/
│   ├── raw/
│   ├── wiki/
│   ├── tasks/
│   ├── outputs/
│   ├── recall/
│   └── audit/
├── evals/
└── apps/
```

## 10. Local Stack

- TypeScript / Node.js, custom CLI, filesystem-first
- SQLite for deterministic state, JSONL traces
- Markdown-first retrieval, optional embeddings
- Python workers for parsing/plotting
- Markdown + Marp + matplotlib output
- Filesystem-compatible with Obsidian
- Claude Code for dev, Agent SDK for orchestration

## 11. Remote Stack (Phase 5)

- TypeScript backend, Agent SDK runtime, job queue
- Object storage + relational DB + search index
- Team workspaces, shared corpora, remote compilation
- Scheduled knowledge health checks, promotion workflows

## 12. MVP

**Goal:** Prove the loop works end to end.

- Ingest markdown, PDF, web-clipped sources
- Compile source summaries and concept pages
- Question answering over compiled wiki
- Generate markdown reports and Marp slides
- Simple lint checks
- File outputs back into workspace
- Show provenance and task trace

## 13. Phase Plan

| Phase | Scope |
|-------|-------|
| 1 | Local foundation — repo, workspace, CLI, SQLite, raw ingest, markdown compiler, provenance, basic ask/render |
| 2 | Knowledge compiler — concept extraction, backlinks, contradiction detection, topic pages, linting |
| 3 | Episodic research — task workspaces, multi-agent roles, structured reports, promotion rules |
| 4 | Recall loop — flashcards, quizzes, retention metadata, weak-area feedback |
| 5 | Remote mode — shared workspaces, multi-user auth, remote jobs, hosted artifact flows |

## 14. What It Is Not

Do not let this collapse into:
- A generic coding agent
- A giant vector DB wrapper
- An Obsidian plugin with delusions of grandeur
- A fancy search box
- A "memory" blob nobody can inspect
- A product only power users can love and nobody can explain
