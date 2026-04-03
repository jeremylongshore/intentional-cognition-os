# CLAUDE.md

## Project Overview

**intentional-cognition-os** — Local-first, remote-capable knowledge operating system that ingests raw sources, compiles semantic memory, creates scoped research workspaces, generates durable artifacts, and improves both machine reasoning and human understanding over time.

- **Runtime**: TypeScript, Node.js 22+, pnpm
- **Repo**: https://github.com/jeremylongshore/intentional-cognition-os
- **License**: MIT
- **Product**: Intentional Cognition OS
- **CLI**: `ico` or `intent`

## Core Thesis

Compile knowledge for the machine. Distill understanding for the human.

One loop: `ingest → compile → reason → render → test → refine`

## Six-Layer Architecture

1. **Raw Corpus Layer** — Source-of-truth inputs (PDFs, articles, repos, notes)
2. **Semantic Knowledge Layer** — Compiled markdown knowledge (summaries, concepts, entities)
3. **Episodic Task Layer** — Temporary research workspaces for complex questions
4. **Artifact Layer** — Durable outputs (reports, slides, charts, briefings)
5. **Recall Layer** — Human learning and retention (flashcards, quizzes, spaced repetition)
6. **Audit & Policy Layer** — Deterministic control plane (traces, provenance, approvals)

## Deterministic vs Probabilistic Boundary

**Deterministic side** owns: file storage, task state, mount table, provenance, policy, audit, permissions, promotion rules, eval execution.

**Probabilistic side** owns: summarization, synthesis, drafting, contradiction suggestions, question decomposition, recall generation, artifact writing.

## Build & Test

```bash
pnpm install          # Install dependencies
pnpm build            # Build all packages
pnpm test             # Run tests
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
```

## Workspace Layout

```
intentional-cognition-os/
├── 000-docs/           # Enterprise documentation (doc-filing v4)
├── .github/            # CI/CD, issue templates, PR template
├── cli/                # CLI entry point (ico/intent)
├── kernel/             # Core runtime
├── compiler/           # Knowledge compilation
├── mounts/             # Corpus mount points
├── workspace/          # Working data
│   ├── raw/            # Ingested source material
│   ├── wiki/           # Compiled semantic knowledge
│   ├── tasks/          # Episodic research workspaces
│   ├── outputs/        # Durable artifacts
│   ├── recall/         # Learning/retention materials
│   └── audit/          # Traces and policy logs
├── evals/              # Evaluation specs
└── apps/               # Optional web UI
```

## Conventions

- Commit messages: `<type>(<scope>): <subject>` (conventional commits)
- Branch naming: `feature/`, `fix/`, `docs/`
- PR workflow: feature branch → PR → review → merge
- Doc filing: `000-docs/` with v4 naming convention

## Task Tracking with Beads (bd)

**Beads provides post-compaction recovery.** Run `/beads` at session start.

**Workflow:** `bd update <id> --status in_progress` → work → `bd close <id> --reason "evidence"`

Key commands: `bd prime` (LLM context), `bd ready`, `bd list --status in_progress`, `bd doctor`

## Non-Negotiable Principles

1. **Knowledge compilation, not just indexing** — Derive summaries, concepts, backlinks, contradictions
2. **Semantic filesystem** — Knowledge feels mounted and operable, not hidden in a blob
3. **Ephemeral research workspaces** — Hard questions get structured working memory
4. **Recall-aware** — Help the human remember, not just the model retrieve
5. **Local + remote symmetry** — Same concepts work locally and remotely
6. **Source integrity** — Raw and derived always separate, provenance always tracked
7. **Deterministic control plane** — Trust, inspectability, controlled automation
