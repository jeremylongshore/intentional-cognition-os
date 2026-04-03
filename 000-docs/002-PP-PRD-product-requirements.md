# Product Requirements: intentional-cognition-os

> Compile knowledge for the machine. Distill understanding for the human.

**Author:** Jeremy Longshore
**Date:** 2026-04-02
**Version:** 0.1.0
**Status:** Draft

## Goals

1. Prove the cognition loop works end-to-end (ingest → compile → reason → render → test → refine)
2. Deliver a local-first CLI that a single user can run against their own files
3. Establish the deterministic/probabilistic boundary as a first-class architectural concept

## Non-Goals

- Building a hosted multi-user service (Phase 5)
- Obsidian plugin compatibility (nice-to-have, not a goal)
- Real-time collaboration
- Mobile app

## User Stories

| ID | Story | Priority |
|----|-------|----------|
| US-01 | As a researcher, I want to ingest PDFs and articles so they're searchable and compilable | P0 |
| US-02 | As a researcher, I want the system to compile topic pages from my sources | P0 |
| US-03 | As a user, I want to ask questions over compiled knowledge and get sourced answers | P0 |
| US-04 | As a user, I want to generate markdown reports from research tasks | P0 |
| US-05 | As a user, I want to generate Marp slide decks from research | P1 |
| US-06 | As a learner, I want flashcards generated from compiled knowledge | P2 |
| US-07 | As a user, I want to lint my knowledge base for gaps and contradictions | P1 |
| US-08 | As a user, I want provenance traced from output back to source | P0 |

## MVP Scope

- [ ] Ingest markdown, PDF, and web-clipped sources
- [ ] Compile source summaries and concept pages
- [ ] Support question answering over compiled wiki
- [ ] Generate markdown reports
- [ ] Generate Marp slide decks
- [ ] Run simple lint checks
- [ ] File outputs back into the workspace
- [ ] Show provenance and task trace

## Success Metrics

| Metric | Target | How Measured |
|--------|--------|-------------|
| End-to-end loop | Working | Can ingest → compile → ask → render in one session |
| Source types | 3+ | PDF, markdown, web clip |
| Compilation quality | Human-verified | Concept pages are accurate and useful |
| Provenance | Complete | Every output traces back to source |
