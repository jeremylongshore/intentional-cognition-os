# Technical Specification: intentional-cognition-os

> Compile knowledge for the machine. Distill understanding for the human.

**Author:** Jeremy Longshore
**Date:** 2026-04-02
**Version:** 0.1.0
**Status:** Draft

## Tech Stack

- **Language:** TypeScript (Node.js 22+)
- **Package Manager:** pnpm
- **CLI Framework:** Commander.js
- **Database:** SQLite (better-sqlite3) for deterministic state
- **Traces:** JSONL for audit trail
- **AI:** Claude API via @anthropic-ai/sdk, Agent SDK for orchestration
- **Workers:** Python for parsing, plotting, document processing
- **Output:** Markdown, Marp (slides), matplotlib (charts)
- **CI/CD:** GitHub Actions

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| commander | ^13.x | CLI framework |
| better-sqlite3 | ^11.x | SQLite state |
| @anthropic-ai/sdk | ^1.x | Claude API |
| zod | ^3.x | Schema validation |
| chalk | ^5.x | Terminal output |
| gray-matter | ^4.x | Frontmatter parsing |

## File Structure

```
intentional-cognition-os/
├── 000-docs/           # Enterprise documentation
├── .github/            # CI/CD, templates
├── cli/                # CLI entry (ico/intent)
├── kernel/             # Core runtime
│   ├── workspace.ts    # Workspace management
│   ├── mounts.ts       # Mount table
│   └── state.ts        # SQLite state
├── compiler/           # Knowledge compilation
│   ├── summarize.ts    # Source summarization
│   ├── extract.ts      # Concept extraction
│   ├── link.ts         # Backlink generation
│   └── diff.ts         # Knowledge diff
├── mounts/             # Corpus mount points
├── workspace/          # Working data (gitignored)
│   ├── raw/            # Ingested sources
│   ├── wiki/           # Compiled knowledge
│   ├── tasks/          # Research workspaces
│   ├── outputs/        # Durable artifacts
│   ├── recall/         # Retention materials
│   └── audit/          # Traces and logs
├── evals/              # Evaluation specs
├── apps/               # Optional web UI
├── README.md
├── CLAUDE.md
└── CONTRIBUTING.md
```

## CLI Commands

| Command | Purpose |
|---------|---------|
| `ico init` | Initialize a new workspace |
| `ico ingest <path>` | Ingest source material |
| `ico mount <path>` | Mount a corpus directory |
| `ico compile topic <name>` | Compile knowledge on a topic |
| `ico ask <question>` | Ask a question over compiled knowledge |
| `ico research <brief>` | Create a research workspace for complex tasks |
| `ico render report` | Generate a markdown report |
| `ico render slides` | Generate Marp slide deck |
| `ico lint knowledge` | Lint the knowledge base |
| `ico recall generate` | Generate flashcards/quizzes |
| `ico recall quiz` | Run a recall quiz |
| `ico eval run` | Run evaluation specs |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| ANTHROPIC_API_KEY | Yes (for AI features) | Claude API key |
| ICO_WORKSPACE | No | Custom workspace path (default: ./workspace) |
| ICO_MODEL | No | Default model (default: claude-sonnet-4-6) |

## Testing

- **Unit Tests:** Vitest
- **Integration Tests:** End-to-end CLI tests with fixtures
- **Coverage Target:** 80%

## Phase Plan

| Phase | Scope |
|-------|-------|
| 1 | Local foundation — repo, workspace, CLI, SQLite, raw ingest, basic compile, provenance |
| 2 | Knowledge compiler — concept extraction, backlinks, contradictions, linting |
| 3 | Episodic research — task workspaces, multi-agent, report generation, promotion |
| 4 | Recall loop — flashcards, quizzes, retention metadata, weak-area feedback |
| 5 | Remote mode — shared workspaces, multi-user auth, remote jobs, hosted artifacts |
