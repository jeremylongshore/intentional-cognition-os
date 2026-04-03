# Intentional Cognition OS — Master Blueprint

**Author:** Jeremy Longshore — Intent Solutions
**Date:** 2026-04-02
**Status:** Brainstorming master blueprint
**Repo:** `intent-cognition-os`
**Product:** Intentional Cognition OS
**CLI:** `ico`
**Shape:** local-first, remote-capable, repo-native cognition system

---

## 1. Executive Summary

Intentional Cognition OS is a knowledge operating system.

It is designed to ingest raw source material, compile that material into a maintained semantic knowledge layer, reason over that layer with agent workflows, generate durable artifacts, and strengthen human understanding through recall-aware loops.

This is not merely:
- chat with docs
- a personal wiki generator
- a note-taking app with AI
- a generic agent shell
- "RAG but better"

It is a system where:

- raw files are collected and preserved
- an LLM compiles those files into structured markdown knowledge
- hard questions can spawn scoped research workspaces
- outputs become reports, slides, charts, and other reusable artifacts
- useful outputs are filed back into the system
- the system can lint, critique, and improve its own knowledge
- human learning can be reinforced through recall and retention flows

**One-line thesis:**
**Compile knowledge for the machine. Distill understanding for the human.**

---

## 2. Core Product Thesis

The market already has strong tooling for:
- coding agents
- terminal agents
- document retrieval
- vector search
- local AI workflows
- note apps with AI overlays

That is not the opening.

The opening is to build a **cognition runtime** where:

1. source material becomes a mounted and inspectable corpus
2. that corpus is compiled into semantic memory
3. questions become structured research operations when needed
4. outputs become durable assets instead of disposable answers
5. the system continuously improves both machine-usable memory and human-usable understanding

Intentional Cognition OS should feel less like "ask a bot" and more like "operate a knowledge system."

---

## 3. Product Shape

Intentional Cognition OS should exist under one identity across three operating surfaces.

### 3.1 Local mode

Runs on a laptop, workstation, or private machine against local files and repos.

Primary uses:
- personal research vaults
- private project knowledge systems
- markdown-native knowledge repos
- local-first analysis and artifact generation
- sensitive or proprietary source work

### 3.2 Remote mode

Runs as a hosted or self-hosted service for shared team or org use.

Primary uses:
- shared corpora
- remote indexing and compilation
- collaborative research workspaces
- org memory systems
- team reports, briefings, and knowledge QA

### 3.3 Repo-native mode

Treats the repo itself as a first-class operating environment.

Primary uses:
- source-controlled knowledge
- durable markdown knowledge layers
- auditable outputs
- repeatable agent workflows
- Claude-native repo memory, skills, and automation surfaces

---

## 4. What the Product Actually Does

At a high level, the system performs five core functions:

### 4.1 Ingest
Collect source material into raw storage.

### 4.2 Compile
Transform source material into structured semantic knowledge.

### 4.3 Reason
Use agents, retrieval, and tools to answer questions or conduct scoped research.

### 4.4 Render
Turn results into durable artifacts such as reports, slides, charts, and study materials.

### 4.5 Refine
Improve the overall system through linting, provenance checks, promotion rules, recall loops, and iterative knowledge enhancement.

This loop is the product.

**Operating loop:**
**ingest -> compile -> reason -> render -> refine**

---

## 5. Strategic Differentiators

### 5.1 Knowledge compilation, not just indexing

The system should not stop at search or retrieval.

It should compile source material into:
- source summaries
- concept pages
- topic pages
- entity pages
- backlinks
- contradiction notes
- open-question files
- derived artifacts

The compiled knowledge layer is the semantic intermediate representation of the corpus.

### 5.2 Semantic filesystem, not magic memory

The system should treat knowledge as mounted and operable.

This means:
- explicit corpus mounts
- indexing passes
- inspectable source paths
- provenance-aware retrieval
- a clear split between physical files and semantic views
- filesystem-like operator behavior

Retrieval should feel like an operable substrate, not a hidden blob.

### 5.3 Episodic research workspaces

Hard questions should not always be answered in one pass.

The system should be able to create temporary task-scoped research environments with:
- evidence folders
- working notes
- synthesis drafts
- skeptical review files
- final outputs

This allows the system to operate like a research runtime rather than a chat interface.

### 5.4 Recall-aware cognition

The system should support both:
- machine knowledge
- human understanding

That means it should eventually generate:
- recall prompts
- quizzes
- flashcards
- spaced-repetition exports
- weak-area reports

This moves the system from storage toward learning.

### 5.5 Audit-first operation

The product should be inspectable by default.

Important events should leave traces:
- task creation
- retrieval hits
- source usage
- promotion decisions
- policy checks
- artifact generation
- eval results

This is essential for trust, debugging, and future product quality.

---

## 6. Layered Architecture

Intentional Cognition OS should be structured as a layered cognition system.

### 6.1 Layer 1 — Raw Corpus Layer

This is the source-of-truth input layer.

Examples:
- articles
- PDFs
- papers
- datasets
- images
- repos
- notes
- transcripts
- clipped web pages

Responsibilities:
- preserve raw source material
- preserve source identity and provenance
- separate raw from derived content
- support replayable ingestion and re-compilation

### 6.2 Layer 2 — Semantic Knowledge Layer

This is the compiled markdown knowledge layer.

Examples:
- source summaries
- concept pages
- topic pages
- entity pages
- relationship notes
- contradiction files
- open-question files
- semantic indexes

Responsibilities:
- reduce reasoning cost
- create inspectable semantic structure
- support retrieval and synthesis
- accumulate reusable understanding over time

### 6.3 Layer 3 — Episodic Task Layer

This is the temporary task-scoped working memory layer.

Examples:
- evidence collection folders
- temporary notes
- comparisons
- drafts
- critiques
- final task outputs

Responsibilities:
- support complex question workflows
- isolate task-specific clutter
- allow multi-agent collaboration
- preserve task traces while keeping long-term memory disciplined

### 6.4 Layer 4 — Artifact Layer

This is the durable output layer.

Examples:
- markdown reports
- Marp slide decks
- charts
- diagrams
- memos
- briefings
- study materials
- reusable reference docs

Responsibilities:
- turn answers into assets
- support cumulative exploration
- allow results to be filed back into the system

### 6.5 Layer 5 — Recall Layer

This is the human retention and learning layer.

Examples:
- flashcards
- quizzes
- concept explanations
- spaced repetition decks
- weak-area reports
- recall history

Responsibilities:
- test user understanding
- identify knowledge weak points
- adapt future outputs
- support long-term retention and transfer

### 6.6 Layer 6 — Audit and Policy Layer

This is the deterministic control layer.

Examples:
- provenance logs
- task traces
- policy checks
- promotion decisions
- permission events
- regression evals
- lint results

Responsibilities:
- ensure inspectability
- enforce policy and lifecycle rules
- support debugging, trust, and replayability
- keep the system operational rather than magical

---

## 7. Mental Model

Intentional Cognition OS is a hybrid of:

- a filesystem
- a compiler
- a research environment
- a report generator
- a knowledge QA system
- a memory coach

That sounds broad until reduced to the core loop:

**ingest -> compile -> reason -> render -> test -> refine**

It is one loop expressed across different user intentions.

---

## 8. User Experience Model

### 8.1 Ingest flow

The user adds source material:
- PDFs
- articles
- repos
- screenshots
- notes
- transcripts
- datasets

The system:
- stores them in raw space
- records metadata
- tracks provenance
- prepares them for compilation

### 8.2 Compile flow

The system:
- creates source summaries
- extracts concepts and entities
- updates topic pages
- maintains backlinks
- surfaces contradictions and gaps
- enriches the semantic knowledge layer

### 8.3 Ask flow

The user asks:
- explain this concept
- compare these ideas
- synthesize the evidence
- summarize this corpus
- generate a report
- find contradictions
- propose next research questions

For simple questions, the system answers directly against compiled knowledge.

For complex questions, the system creates an episodic research workspace.

### 8.4 Render flow

The system produces:
- markdown reports
- slide decks
- charts
- briefings
- notes
- study materials

### 8.5 Promote flow

The system or user promotes durable value back into long-term knowledge where appropriate.

### 8.6 Refine flow

The system:
- runs knowledge health checks
- finds inconsistencies
- suggests missing links
- generates recall material
- improves the structure of future outputs

---

## 9. Deterministic vs Probabilistic Boundary

This boundary should be explicit and enforced.

### 9.1 Deterministic responsibilities

These belong to system-owned logic:
- file storage
- mount registry
- task state
- provenance
- policy
- permissions
- audit logs
- promotion rules
- eval execution
- lifecycle transitions

### 9.2 Probabilistic responsibilities

These belong to model-driven logic:
- summarization
- synthesis
- concept extraction
- topic drafting
- contradiction suggestions
- question decomposition
- artifact drafting
- recall item generation

The system should never blur these beyond recognition.

The model can propose.
The deterministic system should own durable state and control.

---

## 10. Knowledge for the Machine vs Knowledge for the Human

These are related but distinct.

### 10.1 Machine-facing knowledge

Optimized for:
- retrieval
- compression
- provenance
- linkage
- context efficiency
- structured reuse

Examples:
- source summaries
- semantic indexes
- concept graph pages
- citation trails

### 10.2 Human-facing knowledge

Optimized for:
- recall
- understanding
- transfer
- teaching
- retention
- conceptual chunking

Examples:
- flashcards
- quizzes
- study notes
- simplified topic summaries
- explanation prompts

Intentional Cognition OS should maintain both layers rather than forcing one format to serve both.

---

## 11. Multi-Agent Episodic Research Pattern

For harder problems, the system should support multi-agent task workflows.

### 11.1 Task sequence

1. Create task workspace
2. Collect relevant evidence
3. Generate scoped working notes
4. Assign specialized roles
5. Run critique and contradiction passes
6. Produce final artifact
7. Generate optional recall material
8. Promote only durable value into long-term memory
9. Archive or prune temporary work appropriately

### 11.2 Example roles

Possible subagent roles:
- collector
- summarizer
- skeptic
- contradiction finder
- integrator
- artifact builder
- recall generator

This is how the system evolves from "answer engine" to "research engine."

---

## 12. Artifact Philosophy

The system should avoid ephemeral-only outputs.

Important work should result in durable artifacts such as:
- reports
- slide decks
- study sheets
- charts
- briefings
- architecture notes
- comparison docs

Outputs should be file-based and inspectable.

Useful outputs should be promotable back into the knowledge system under clear rules.

Questions should add up.

---

## 13. Recall and Second-Brain Evolution

The long-term opportunity is larger than a wiki.

A true second-brain system should:
- identify important concepts
- compress them into useful learning units
- test what the user actually understands
- track weak spots over time
- adapt future summaries and explanations accordingly

This creates a loop where:
- the machine maintains semantic memory
- the human strengthens retained understanding

**Extended loop:**
**ingest -> compile -> reason -> render -> test recall -> refine -> promote**

---

## 14. Local Architecture Rough Draft

### 14.1 Core runtime

- TypeScript / Node.js
- custom `ico` CLI
- filesystem-first workspace
- SQLite for deterministic local state
- JSONL or equivalent task/audit logs

### 14.2 Retrieval

- markdown-first local retrieval layer
- QMD or equivalent query substrate
- simple full-text and semantic retrieval
- avoid overbuilt vector infrastructure early

### 14.3 Workers

- Python for document-heavy or plotting-heavy jobs
- parsing pipelines
- report charts
- future distillation experiments

### 14.4 Outputs

- Markdown first
- Marp for slides
- matplotlib for charts
- optional HTML reports later

### 14.5 Frontend posture

- Obsidian-compatible artifacts
- optional lightweight local web UI later
- no hard dependency on any single frontend

### 14.6 Claude-native surfaces

- Claude Code for repo-native development and workflows
- Agent SDK for programmable runtime/orchestration
- repo-local Claude memory, agents, skills, and hooks where useful

---

## 15. Remote Architecture Rough Draft

### 15.1 API and orchestration

- TypeScript backend
- custom orchestration layer
- task/job system
- remote execution boundaries

### 15.2 Storage

- object storage for raw files and artifacts
- relational database for state, metadata, policy, audit
- search/index layer for remote retrieval

### 15.3 Multi-user capabilities

- user and org workspaces
- shared corpora
- shared artifacts
- policy-governed promotion flows
- per-user recall and retention tracking

### 15.4 Remote-first value

- collaborative research
- scheduled knowledge health checks
- remote compilation jobs
- team memory systems
- org briefings and artifact pipelines

---

## 16. Recommended Workspace Shape

```text
intent-cognition-os/
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

### 16.1 Example workspace detail

```text
workspace/
├── raw/
│   ├── articles/
│   ├── papers/
│   ├── repos/
│   ├── datasets/
│   ├── images/
│   └── notes/
├── wiki/
│   ├── sources/
│   ├── concepts/
│   ├── entities/
│   ├── topics/
│   ├── contradictions/
│   ├── open-questions/
│   └── indexes/
├── tasks/
│   └── <task-id>/
│       ├── evidence/
│       ├── notes/
│       ├── drafts/
│       ├── critique/
│       └── output/
├── outputs/
│   ├── reports/
│   ├── slides/
│   ├── charts/
│   ├── diagrams/
│   └── briefings/
├── recall/
│   ├── cards/
│   ├── decks/
│   ├── quizzes/
│   └── retention/
└── audit/
    ├── traces/
    ├── provenance/
    ├── policy/
    └── promotions/
```

---

## 17. Example CLI Shape

```bash
ico ingest ./sources
ico mount ./workspace/raw
ico compile topic "agent memory"
ico ask "Compare semantic memory vs episodic task memory"
ico research "Build a briefing on intent systems"
ico render report --task latest
ico render slides --task latest
ico lint knowledge
ico recall generate --topic "agent identity"
ico eval run
```

This CLI should feel operational and inspectable rather than magical.

---

## 18. What the Product Is Not

Intentional Cognition OS should not collapse into:
- a generic coding agent
- a giant vector database wrapper
- an Obsidian-only product
- a fancy search bar with branding
- a vague AI memory blob
- a one-shot research bot with no durable output
- a shell demo pretending to be an operating system

The metaphor only works if it is made operational:
- mounts
- compiler
- tasks
- artifacts
- policy
- traces
- evals

---

## 19. MVP Definition

The MVP should prove the end-to-end loop, not every future idea.

### 19.1 MVP goal

Prove that raw sources can be transformed into useful semantic memory, queried effectively, rendered into durable artifacts, and improved over time.

### 19.2 MVP capabilities

- ingest markdown, PDF, and basic web-clipped sources
- preserve provenance and raw/derived separation
- compile source summaries and simple concept/topic pages
- answer questions against compiled knowledge
- generate markdown reports
- generate Marp slide decks
- run simple lint/integrity checks
- file useful outputs back into the workspace
- show task trace and provenance

### 19.3 MVP non-goals

Defer or keep light:
- heavy remote infra
- complex collaboration UX
- advanced graph visualizations
- model fine-tuning
- too many fancy agent modes
- distributed storage complexity
- overbuilt memory systems

The MVP should prove the loop, not the whole philosophy at once.

---

## 20. Rough Phase Plan

### Phase 1 — Local foundation
- repo scaffold
- workspace layout
- CLI shell
- SQLite state
- raw ingest
- provenance tracking
- simple ask/render flow

### Phase 2 — Knowledge compiler
- source summaries
- concept extraction
- topic pages
- backlinks
- contradiction detection
- knowledge linting

### Phase 3 — Episodic research
- task workspaces
- structured research runs
- multi-agent role patterns
- durable report generation
- promotion rules

### Phase 4 — Recall loop
- flashcards
- quizzes
- retention metadata
- weak-area feedback loop
- learning-aware output refinement

### Phase 5 — Remote mode
- shared workspaces
- remote jobs
- auth boundaries
- team memory workflows
- hosted artifact pipelines

---

## 21. Naming Guidance

Use one coherent identity everywhere.

- **Product:** Intentional Cognition OS
- **Repo:** intent-cognition-os
- **CLI:** `ico`
- **Internal shorthand:** ICO

This keeps the system legible and avoids branding fragmentation before the product exists.

---

## 22. Strategic Conclusion

Intentional Cognition OS is a local-first, remote-capable knowledge operating system that ingests raw sources, compiles them into semantic memory, creates scoped research environments for complex questions, produces durable artifacts, and improves both machine reasoning and human understanding over time.

The wiki is not the end state.
The wiki is the compiled intermediate layer.

The deeper product is a cognition runtime with a disciplined operating loop:

**ingest -> compile -> reason -> render -> test -> refine**

Internal summary:
**A cognition runtime, not a chat wrapper.**
