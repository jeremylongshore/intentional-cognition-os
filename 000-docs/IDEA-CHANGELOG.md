# Idea Changelog

All notable idea and architecture changes for the Intentional Cognition OS master blueprint will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Version numbers follow the blueprint version, not the software release.

## [Unreleased]

## [2.0.0] - 2026-04-02

### Added

- **Data classification taxonomy** — every piece of data in the system is now classified as exactly one of: canonical, compiled, ephemeral, durable, adaptive, or audit. V1 had layers but no explicit classification rules for what lives where and why.
- **Compiler passes defined** — the compiler is now specified as six named passes (Summarize, Extract, Synthesize, Link, Contradict, Gap) with defined inputs and outputs. V1 said "the system compiles" but never defined what compilation actually does.
- **Staleness model** — compiled pages are now explicitly stale when source hashes change, new matching sources arrive, or dependent pages are recompiled. V1 mentioned "linting" but had no staleness definition.
- **Compilation triggers** — each CLI command maps to specific compiler passes. V1 listed CLI commands but didn't connect them to compilation behavior.
- **Promotion rules** — seven explicit rules governing how outputs move from L4 back to L2, including the rule that automatic promotion is never allowed. V1 mentioned promotion repeatedly but never defined the rules.
- **Task lifecycle state machine** — research tasks now have a defined lifecycle: created → collecting → synthesizing → critiquing → rendering → completed → archived. V1 described multi-agent research but had no lifecycle model.
- **Recall feedback loop** — quiz results now update retention scores per concept, driving adaptive generation. V1 listed recall features but didn't specify how feedback flows back.

### Changed

- **Document structure** — reduced from 22 sections to 16 by merging redundant content. V1 had separate sections for core functions (Section 4), mental model (Section 7), UX flows (Section 8), and artifact philosophy (Section 12) that all described the same concepts. These are now consolidated.
- **Operating loop** — canonicalized as `ingest → compile → reason → render → refine` and stated once. V1 had three variant versions of the loop scattered across the document ("ingest → compile → reason → render → refine", "ingest → compile → reason → render → test → refine", and "ingest → compile → reason → render → test recall → refine → promote").
- **Terminology** — standardized throughout. "Semantic Knowledge Layer" is now the only name for L2 (V1 alternated between "compiled wiki", "semantic memory", and "semantic knowledge layer"). "Episodic Tasks" is the only name for L3 (V1 used "research workspaces", "task workspaces", and "episodic research" interchangeably).
- **Layer descriptions** — each layer now specifies storage location, mutability model, and data classification. V1 described layers with examples and responsibilities but not lifecycle behavior.
- **Deterministic/probabilistic boundary** — reframed from a philosophical principle to an architectural constraint with a concrete rule: "The model proposes content. The deterministic system owns state, provenance, policy, and lifecycle." V1 stated the principle but left it abstract.
- **Tech stack** — presented as a single table with rationale column instead of two separate "rough draft" sections (local vs remote). V1 hedged everything as "rough draft"; V2 commits to decisions for Phases 1-4 and explicitly defers remote-specific choices.
- **CLI section** — consolidated into a single command reference table. V1 had CLI examples scattered across Sections 4, 8, and 17.
- **Phase plan** — compressed from prose descriptions to a single table with phase name and scope. V1 had a separate section describing each phase in paragraph form that largely restated the PRD.

### Removed

- **Section 7: Mental Model** — "ICO is a hybrid of a filesystem, a compiler, a research environment..." This analogy list added nothing actionable. The thesis and architecture sections already communicate the product identity.
- **Section 8: User Experience Model** — the six "flows" (ingest, compile, ask, render, promote, refine) were a restatement of Section 4's five core functions with slightly more detail. The information now lives in the operating loop definition and the compiler/promotion/research sections.
- **Section 10: Machine vs Human Knowledge** — the distinction between machine-facing and human-facing knowledge is real but was underdeveloped as a standalone section. It is now integrated into the Recall Model (Section 9) where it has concrete implementation context.
- **Section 12: Artifact Philosophy** — "questions should add up" and "outputs should be file-based and inspectable" are true but restated what the architecture already specifies. Removed as standalone section; the L4 layer definition covers artifact behavior.
- **Section 13: Recall and Second-Brain Evolution** — speculative Phase 4+ content that was mostly aspirational. The concrete recall model in Section 9 replaces it.
- **"Rough draft" hedging throughout** — V1 labeled both architecture sections as "rough drafts" and used language like "should eventually support" and "could also use." V2 commits to decisions and explicitly defers what isn't decided yet.
- **Repeated loop statements** — V1 stated the operating loop in Sections 2, 4, 7, 8, 13, and 22. V2 states it once in Section 2 and references it.

### Fixed

- **Loop inconsistency** — V1 had three different versions of the operating loop. V2 canonicalizes it as five stages: ingest → compile → reason → render → refine. "Test" is part of refine (via `ico lint` and `ico recall`). "Promote" is part of refine (via `ico promote`).
- **Layer mutability ambiguity** — V1 didn't specify whether layers were append-only, mutable, or recompilable. V2 defines mutability for each layer: L1 and L6 are append-only, L2 is recompilable, L3 is ephemeral, L4 is permanent, L5 is adaptive.
- **Promotion without rules** — V1 mentioned promotion ~8 times without ever defining what it means or when it's appropriate. V2 defines seven explicit rules and three anti-patterns.
- **Compiler without passes** — V1 said "the system compiles" but never defined the compilation process. V2 specifies six named passes with inputs, outputs, and triggers.
- **Research tasks without lifecycle** — V1 described multi-agent research conceptually but had no state machine or completion criteria. V2 defines a task lifecycle with explicit transitions.
- **Terminology drift** — V1 used 2-3 names for each major concept. V2 enforces one canonical name per concept used consistently throughout.

## [1.0.0] - 2026-04-02

### Added

- Initial master blueprint with 22 sections
- Core thesis: "Compile knowledge for the machine. Distill understanding for the human."
- Six-layer architecture (Raw Corpus, Semantic Knowledge, Episodic Tasks, Artifacts, Recall, Audit & Policy)
- Deterministic vs probabilistic boundary concept
- Three product surfaces: local, remote, repo-native
- CLI shape with `ico` command vocabulary
- Workspace layout with layered directories
- Multi-agent research pattern with role-based agents
- Five-phase development plan
- "What this is not" guardrails
- MVP definition
- Local and remote architecture sketches

### Decision Notes

- Chose TypeScript + Node.js for Claude SDK compatibility and type safety
- Chose SQLite for local-first state with zero infrastructure
- Chose markdown-first retrieval over vector DB to keep early phases simple
- Chose "compiler" metaphor to distinguish from retrieval-only systems
- Chose `ico` as CLI name for brevity and product coherence
