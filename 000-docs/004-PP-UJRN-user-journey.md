# User Journey: intentional-cognition-os

> Compile knowledge for the machine. Distill understanding for the human.

**Author:** Jeremy Longshore
**Date:** 2026-04-02
**Status:** Draft

## Persona

| Field | Value |
|-------|-------|
| Role | Researcher / knowledge worker |
| Goal | Build and maintain a personal knowledge system that compounds |
| Experience Level | Intermediate — comfortable with CLI, familiar with LLMs |

## Prerequisites

- [ ] Node.js 22+ installed
- [ ] pnpm installed
- [ ] Claude API key (for compilation and reasoning)

## Walkthrough

### Step 1: Initialize Workspace

```bash
ico init my-research
cd my-research
```

**Expected Result:** A workspace directory is created with the standard layout (raw/, wiki/, tasks/, outputs/, recall/, audit/).

### Step 2: Ingest Sources

```bash
ico ingest ./papers/*.pdf
ico ingest ./articles/
ico ingest https://example.com/article.html
```

**Expected Result:** Sources are copied to `workspace/raw/` with metadata extracted and provenance recorded.

### Step 3: Compile Knowledge

```bash
ico compile topic "agent memory systems"
```

**Expected Result:** The compiler reads relevant sources, generates summaries, creates concept pages in `workspace/wiki/`, adds backlinks, and flags contradictions.

### Step 4: Ask Questions

```bash
ico ask "Compare semantic memory vs episodic task memory in AI agents"
```

**Expected Result:** The system reasons over compiled knowledge, cites sources, and returns a structured answer with provenance.

### Step 5: Research (Complex Tasks)

```bash
ico research "Build a briefing on trust signals in decentralized identity"
```

**Expected Result:** A temporary research workspace is created. Multiple agents collect evidence, summarize, critique, and integrate. A final briefing is generated in `workspace/outputs/`.

### Step 6: Render Artifacts

```bash
ico render report --task latest
ico render slides --task latest
```

**Expected Result:** Markdown report and Marp slide deck generated from the latest research task.

### Step 7: Recall

```bash
ico recall generate --topic "agent memory"
ico recall quiz
```

**Expected Result:** Flashcards and quiz questions generated from compiled knowledge. Weak areas tracked.

### Step 8: Lint & Refine

```bash
ico lint knowledge
```

**Expected Result:** Gaps, contradictions, stale sources, and missing links identified. Suggestions for improvement.

## Error Scenarios

| Scenario | Error Message | Resolution |
|----------|--------------|------------|
| No API key | `ANTHROPIC_API_KEY not set` | Set in .env |
| Empty workspace | `No sources ingested yet` | Run `ico ingest` first |
| PDF parse failure | `Failed to extract text from X.pdf` | Check PDF is not image-only |

## FAQ

**Q: Can I use this without an API key?**
A: The deterministic layers (ingest, storage, mount, audit) work offline. Compilation and reasoning require an API key.

**Q: Does this replace Obsidian?**
A: No. The wiki/ output is Obsidian-compatible markdown, so they complement each other.
