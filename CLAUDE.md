# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**intentional-cognition-os** — Local-first knowledge operating system that ingests raw corpus, compiles semantic knowledge, creates episodic task workspaces, generates durable artifacts, and improves both machine reasoning and human understanding over time.

- **Runtime**: TypeScript, Node.js 22+, pnpm 10.x
- **CLI**: `ico` (planned)
- **License**: MIT
- **Current state**: Pre-implementation — architecture and docs complete, no source code yet

## Current State

This project has extensive documentation and CI/CD but **zero application code**. All `pnpm` scripts are stubs:

```bash
pnpm install          # Works — installs (empty) dependencies
pnpm build            # Stub — echoes "No build configured yet"
pnpm test             # Stub — echoes "No tests configured yet"
pnpm lint             # Stub — echoes "No linter configured yet"
pnpm typecheck        # Stub — echoes "No typecheck configured yet"
```

The directories listed in the architecture docs (`packages/types/`, `packages/kernel/`, `packages/compiler/`, `packages/cli/`, `evals/`) **do not exist yet**. They will be created during Epic 2 (Repo Foundation).

## Planned Tech Stack (from 000-docs/005-AT-SPEC)

| Purpose | Package | Notes |
|---------|---------|-------|
| CLI | Commander.js | Entry point at `packages/cli/src/index.ts` |
| State DB | better-sqlite3 | Local SQLite for deterministic state |
| AI | @anthropic-ai/sdk | Claude API for compilation/reasoning |
| Orchestration | claude_agent_sdk | Multi-agent research (Phase 3) |
| Validation | Zod | Runtime schema checking |
| Frontmatter | gray-matter | Parsing compiled wiki pages |
| Testing | Vitest | Test runner |
| Build | tsup | TypeScript bundling |
| Linting | ESLint + typescript-eslint | Code quality |

## Architecture

Core loop: `ingest → compile → reason → render → refine`

### Six Layers

| Layer | Storage Path | Mutability |
|-------|-------------|------------|
| 1. Raw Corpus — source inputs | `workspace/raw/` | Append-only |
| 2. Semantic Knowledge — compiled markdown | `workspace/wiki/` | Recompilable |
| 3. Episodic Tasks — research workspaces | `workspace/tasks/<id>/` | Per-task lifecycle |
| 4. Artifacts — reports, slides, charts | `workspace/outputs/` | Promotable to L2 |
| 5. Recall — flashcards, spaced repetition | `workspace/recall/` | Adaptive |
| 6. Audit & Policy — traces, provenance | `workspace/audit/` | Append-only |

### Deterministic vs Probabilistic Boundary

This is the most important architectural constraint. The model proposes; the deterministic system owns durable state and control. The model never directly writes to audit, policy, or promotion tables.

- **Deterministic** (Kernel + SQLite + JSONL): file storage, mount registry, task state, provenance, policy, permissions, audit, promotion rules, eval execution
- **Probabilistic** (Compiler + Claude API): summarization, synthesis, concept extraction, contradiction detection, question decomposition, artifact drafting, recall generation

### Planned Components

| Component | Directory | Responsibility |
|-----------|-----------|---------------|
| Types | `packages/types/` | Shared TypeScript interfaces and Zod schemas |
| Kernel | `packages/kernel/` | Workspace management, mount registry, state machine |
| Compiler | `packages/compiler/` | Knowledge compilation — summarize, extract, link, diff, lint |
| CLI | `packages/cli/` | Command routing, argument parsing, output formatting |
| Evals | `evals/` | Evaluation specs for compilation quality |

### Multi-Agent Research Pattern

For `ico research`, the system creates a scoped episodic task workspace with: collector agents → summarizers → skeptics → integrator → renderer → optional recall generation → promote durable value back to L2 → archive workspace.

## Documentation

Detailed specs live in `000-docs/` (doc-filing v4 naming):

- `007-PP-PLAN-master-blueprint.md` — Authoritative design document (start here)
- `003-AT-ARCH-architecture.md` — System design, data flow diagrams
- `005-AT-SPEC-technical-spec.md` — Stack choices, file structure, API contracts
- `002-PP-PRD-product-requirements.md` — Requirements and user stories
- `IDEA-CHANGELOG.md` — Design decision log
- `EXECUTION-PLAN-10-EPICS.md` — 10-epic implementation plan (114 beads)
- `epics/epic-{01..10}.md` — Individual epic reference docs

## CI/CD

- **CI** (`.github/workflows/ci.yml`): Runs lint, typecheck, and test on push/PR to main
- **Release** (`.github/workflows/release.yml`): Auto-versioning from conventional commits, CHANGELOG generation, GitHub Release creation. Triggers on push to main or manual dispatch with bump type override.

## Conventions

- Conventional commits: `<type>(<scope>): <subject>` — types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`
- Branch naming: `feature/`, `fix/`, `docs/`
- 2-space indentation, LF line endings, UTF-8 (see `.editorconfig`)
- TypeScript strict mode

## Non-Negotiable Principles

1. **Compilation, not indexing** — Derive summaries, concepts, backlinks, contradictions from sources
2. **Semantic filesystem** — Knowledge is mounted and operable, not hidden in a vector blob
3. **Ephemeral episodic tasks** — Hard questions get structured working memory that gets archived
4. **Source integrity** — Raw and derived always separate, provenance always tracked
5. **Deterministic control plane** — The model proposes, the system decides
