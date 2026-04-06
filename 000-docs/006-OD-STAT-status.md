# Status: intentional-cognition-os

> Compile knowledge for the machine. Distill understanding for the human.

**Last Updated:** 2026-04-05

## Current State

**Repo status:** Governance complete. Architecture stabilized at blueprint v2.2. No application code yet — all `pnpm` scripts are stubs. Phase 1 implementation has not started.

**What exists:**
- [x] Master blueprint v2.2 (16 sections, including learning model and schema contract)
- [x] Enterprise documentation suite (8 docs in `000-docs/`)
- [x] Repo governance (21 files — CONTRIBUTING, SECURITY, CODE_OF_CONDUCT, etc.)
- [x] CI/CD operational (lint, typecheck, test jobs + auto-release workflow)
- [x] v0.1.2 released (governance + docs only, no runtime)
- [x] Idea changelog tracking blueprint evolution (v1.0 → v2.0 → v2.1 → v2.2)

**What does not exist yet:**
- [ ] pnpm workspace with packages (`kernel/`, `cli/`, `compiler/`)
- [ ] Any TypeScript source code
- [ ] SQLite state schema
- [ ] Working CLI commands
- [ ] Tests beyond CI stub passes

The current release (v0.1.2) is a documentation release. It proves the governance and architectural planning are done. It does not prove the operating loop works.

## Learning Stance

The system improves over time at three layers (blueprint Section 5.6):

| Layer | What | When |
|-------|------|------|
| **Context** | `CLAUDE.md`, schemas, compiled wiki, agent rules, recall history | Now — primary learning surface for Phases 1-4 |
| **Harness** | CLI, kernel, compiler passes, orchestration, promotion rules | Later — offline refinement via traces/evals (Phase 3+) |
| **Model** | Foundation weights | Deferred — not near-term scope |

This does not add new build scope. Context learning happens naturally through operator curation and governed system behavior. Harness learning requires trace accumulation before it becomes actionable.

## Current Phase

**Phase 0 — Governance & Scaffolding** — Complete.

**Next: Phase 1 — Local Foundation** — Not started.

## Phase Plan

| Phase | Status | Scope | Exit Criteria |
|-------|--------|-------|---------------|
| 0. Governance & Scaffolding | **Complete** | Repo, docs, CI/CD, blueprint | Repo dressed, blueprint stable, CI green |
| 1. Local Foundation | Not Started | Workspace layout, CLI skeleton, SQLite state, raw ingest with provenance, basic ask/render | `ico init`, `ico ingest`, `ico ask`, `ico render report` working end-to-end on a local corpus; provenance traceable from rendered output back to source; `index.md` and `log.md` maintained |
| 2. Knowledge Compiler | Not Started | Summarize, Extract, Synthesize, Link, Contradict, Gap passes; knowledge linting; schema conformance | All six compiler passes produce schema-conformant output; `ico lint knowledge` catches staleness and gaps; compiled wiki navigable via `index.md` |
| 3. Episodic Research | Not Started | Task workspaces, multi-agent roles, structured reports, promotion rules | Research task runs end-to-end (create → collect → synthesize → critique → render → archive); promotion works under defined rules; traces sufficient to begin harness-level analysis |
| 4. Recall Loop | Not Started | Flashcards, quizzes, retention tracking, weak-area feedback | `ico recall generate` and `ico recall quiz` working; retention scores update from quiz results; weak-area feedback loop closes |
| 5. Remote Mode | Not Started | Shared workspaces, auth, remote jobs, team memory | Deferred — requirements not yet specified |

## Risks and Watch Items

| Risk | Impact | Mitigation |
|------|--------|------------|
| Blueprint is over-specified for a project with no code | Architecture may drift during implementation as real constraints emerge | Treat blueprint as living doc; update when implementation contradicts design |
| All CI scripts are stubs (`echo "No X configured yet"`) | CI passes vacuously — no actual quality gate until real tests exist | First Phase 1 task: replace stubs with real tooling before writing features |
| Compiler pass quality depends entirely on prompt engineering | Summarize/Extract/Synthesize output quality is unknown until tested on real sources | Phase 1 should include manual evaluation of compilation output on 3-5 diverse sources before scaling |
| No frontmatter schemas defined yet | Blueprint v2.1+ references schema conformance but schemas don't exist | Define schemas as first compiler task, before implementing passes |

## Next Steps (Phase 1)

1. Replace `pnpm` script stubs with real tooling (tsup build, vitest test, eslint lint, tsc typecheck)
2. Initialize pnpm workspace with `pnpm-workspace.yaml`
3. Create packages: `kernel/`, `cli/`, `compiler/`
4. Set up shared tsconfig and build tooling
5. Define frontmatter schemas for each compiled page type (source summary, concept, topic, entity)
6. Implement `kernel/workspace.ts` — workspace init and directory layout
7. Implement `kernel/state.ts` — SQLite schema and migrations
8. Implement `kernel/mounts.ts` — corpus mount registry
9. Implement `kernel/provenance.ts` — provenance tracking
10. Wire up CLI skeleton with Commander.js
11. Implement `ico init`, `ico ingest` (source-by-source, human-in-the-loop), `ico mount`, `ico status`
12. Implement basic `ico ask` with Claude API
13. Implement `ico render report` and `ico render slides`
14. Implement `workspace/wiki/index.md` and `workspace/audit/log.md` generation
15. Add integration tests with fixture workspaces
16. Manual evaluation: run compilation on 3-5 diverse sources, review output quality
17. Cut v0.2.0

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Test Coverage | 80% | 0% (no code) |
| CI Pass Rate | 100% | 100% (stub scripts) |
| Open Issues | <10 | 0 |
| Governance Files | 21 | 21 |
| Enterprise Docs | 8 | 8 |
| Blueprint Version | — | v2.2.0 |
| Software Release | — | v0.1.2 (docs only) |

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-04-02 | Governance-first setup | Establish quality baseline before code |
| 2026-04-02 | TypeScript + pnpm monorepo | Type safety, Claude SDK native, workspace support |
| 2026-04-02 | SQLite for local state | Zero infrastructure, local-first, deterministic |
| 2026-04-02 | 6-layer architecture | Clean separation: raw → semantic → episodic → artifact → recall → audit |
| 2026-04-02 | Deterministic/probabilistic boundary | Model proposes, system controls — most important architectural constraint |
| 2026-04-02 | Markdown-first retrieval | No vector DB until proven needed |
| 2026-04-02 | CLI name: `ico` | Short, memorable, consistent with product identity |
| 2026-04-04 | Schema contract as architecture | `CLAUDE.md`, frontmatter, file policies are load-bearing, not garnish |
| 2026-04-04 | Human-in-the-loop ingest default | Quality decision — batch comes after trust in single-source output |
| 2026-04-05 | Three-layer learning model | Context first, harness later, model deferred — no new build scope |

## Release History

| Version | Date | Contents |
|---------|------|----------|
| 0.1.2 | 2026-04-02 | Blueprint v2 rewrite, full enterprise docs |
| 0.1.1 | 2026-04-02 | Dependency updates (actions/setup-node, actions/checkout) |
| 0.1.0 | 2026-04-02 | Initial release — governance, CI/CD, package.json |
