# Status: intentional-cognition-os

> Compile knowledge for the machine. Distill understanding for the human.

**Last Updated:** 2026-04-02

## Current State

- [x] Master blueprint written (22 sections, full product thesis)
- [x] Repo created and dressed (21 governance + 7 docs)
- [x] CI/CD operational (lint, typecheck, test, release automation)
- [x] v0.1.0 released
- [ ] pnpm workspace initialized with packages
- [ ] Kernel package scaffolded (workspace, mounts, state, provenance)
- [ ] CLI package scaffolded (Commander.js, command routing)
- [ ] Compiler package scaffolded (summarize, extract, link)
- [ ] Raw ingest working (markdown, PDF)
- [ ] SQLite state schema deployed
- [ ] Basic `ico ask` flow connected to Claude API
- [ ] `ico render report` producing markdown
- [ ] `ico render slides` producing Marp decks
- [ ] Provenance tracking end-to-end
- [ ] Tests written (target: 80% coverage)

## Current Phase

**Phase 0 — Governance & Scaffolding** (complete)

**Next: Phase 1 — Local Foundation**

## Phase Plan

| Phase | Status | Target |
|-------|--------|--------|
| 0. Governance & Scaffolding | Complete | Done |
| 1. Local Foundation | Not Started | Repo scaffold, CLI, SQLite, ingest, provenance, basic ask/render |
| 2. Knowledge Compiler | Not Started | Summaries, concepts, topics, backlinks, contradictions, linting |
| 3. Episodic Research | Not Started | Task workspaces, multi-agent, reports, promotion |
| 4. Recall Loop | Not Started | Flashcards, quizzes, retention, weak-area feedback |
| 5. Remote Mode | Not Started | Shared workspaces, auth, remote jobs, team memory |

## Blockers

| Blocker | Owner | ETA |
|---------|-------|-----|
| None | — | — |

## Next Steps (Phase 1)

1. Initialize pnpm workspace with `pnpm-workspace.yaml`
2. Create three packages: `kernel/`, `cli/`, `compiler/`
3. Set up shared tsconfig and build tooling
4. Implement `kernel/workspace.ts` — workspace init and layout
5. Implement `kernel/state.ts` — SQLite schema and migrations
6. Implement `kernel/mounts.ts` — corpus mount registry
7. Implement `kernel/provenance.ts` — provenance tracking
8. Wire up CLI skeleton with Commander.js
9. Implement `ico init`, `ico ingest`, `ico mount`, `ico status`
10. Implement basic `ico ask` with Claude API
11. Implement `ico render report` and `ico render slides`
12. Add integration tests with fixture workspaces
13. Cut v0.2.0

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Test Coverage | 80% | — |
| CI Pass Rate | 100% | 100% |
| Open Issues | <10 | 0 |
| Governance Files | 21 | 21 |
| Enterprise Docs | 7 | 7 |
| Release | v0.1.0 | v0.1.0 |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-02 | Governance-first setup | Establish quality baseline before code |
| 2026-04-02 | TypeScript + pnpm monorepo | Matches j-rig patterns, strong typing, workspace support |
| 2026-04-02 | SQLite for local state | Zero infrastructure, local-first, deterministic |
| 2026-04-02 | 6-layer architecture | Clean separation: raw -> semantic -> episodic -> artifact -> recall -> audit |
| 2026-04-02 | Deterministic/probabilistic boundary | Most important architectural constraint — model proposes, system controls |
| 2026-04-02 | Markdown-first retrieval | Simple before complex — no vector DB until proven needed |
| 2026-04-02 | CLI name: `ico` | Short, memorable, consistent with product identity |

## Release History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-04-02 | Initial release — governance, docs, CI/CD, master blueprint |
