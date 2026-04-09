---
title: Test Quality Audit — Kernel & Compiler
date: 2026-04-09
scope: packages/kernel, packages/compiler
trigger: CWP procfs implementation + adversarial review
---

# Test Quality Audit

## Summary

| Metric | Value |
|--------|-------|
| Total test files | 44 (19 kernel + 25 compiler) |
| Total tests | 572 (240 kernel + 332 compiler) |
| All passing | Yes |
| Source file coverage | 95% (41/43 — only version.ts uncovered) |
| Framework | Vitest 4.1.2 |
| Duration | ~4.4s total |

## Source-to-Test Coverage

### Kernel (18/19 = 95%)

| Source | Test | Status |
|--------|------|--------|
| artifacts.ts | artifacts.test.ts | OK |
| audit-log.ts | audit-log.test.ts | OK |
| config.ts | config.test.ts | OK |
| index.ts | index.test.ts | OK |
| logger.ts | logger.test.ts | OK |
| mounts.ts | mounts.test.ts | OK |
| post-promote.ts | post-promote.test.ts | OK |
| **procfs.ts** | **procfs.test.ts** | **OK (NEW)** |
| promotion.ts | promotion.test.ts | OK |
| provenance.ts | provenance.test.ts | OK |
| search.ts | search.test.ts | OK |
| sources.ts | sources.test.ts | OK |
| state.ts | state.test.ts | OK |
| tasks.ts | tasks.test.ts | OK |
| traces.ts | traces.test.ts | OK |
| unpromote.ts | unpromote.test.ts | OK |
| wiki-index.ts | wiki-index.test.ts | OK |
| workspace.ts | workspace.test.ts | OK |
| version.ts | — | GAP (trivial constant) |

### Compiler (23/24 = 96%)

All passes, adapters, ask pipeline, and render modules covered. Only version.ts uncovered.

## Quality Scorecard

| File | Grade | Tests | Avg Assert/Test | Negative % |
|------|-------|-------|-----------------|------------|
| procfs.test.ts (NEW) | A- | 13 | 3.6 | 17% |
| tasks.test.ts | A | 11 | 4.7 | 27% |
| traces.test.ts | A- | 14 | 3.6 | 7% |
| summarize.test.ts | B+ | 9 | 3.9 | 11% |
| extract.test.ts | B | 10 | 3.0 | 20% |

**Aggregate: 57 tests, 214 assertions, avg 3.8/test. Overall grade: B+**

## Bias Patterns Detected

| Pattern | Occurrences | Severity | Files |
|---------|-------------|----------|-------|
| Range-only assertions | 6 | Medium | traces, extract, tasks, procfs |
| Smoke-only (weak error checks) | 3 | Low | procfs, extract, summarize |
| Redundant invocations | 2 | Low | summarize, extract |
| Mutation-insensitive | 1 | Low | summarize |

No tautological, self-referential, identity misuse, or symmetric input bias detected.

## Top Recommendations

1. **Increase negative test coverage in traces.test.ts** (currently 7%) — Add tests for invalid event types, malformed payloads, combined filters.

2. **Replace range-only assertions with exact values** — When mocks control the input, `toBeGreaterThanOrEqual(1)` should be `toBe(1)`. Weak assertions mask regressions.

3. **Add materializeMemoryMap test to procfs.test.ts** — Only status.md materialization is tested; memory-map.md rendering is tested but not disk materialization.

4. **Reduce redundant setup in compiler pass tests** — summarize and extract tests invoke the same function 8+ times with identical args. Use shared beforeAll or vary inputs.

## Conclusion

The codebase is in good shape. 95% file coverage, 572 passing tests, no failures. The new procfs module (13 tests, grade A-) integrates cleanly. The main quality gap is low negative test coverage in traces and compiler passes — these should be addressed before Epic 9 multi-agent work where error handling becomes critical.
