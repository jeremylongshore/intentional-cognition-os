import { defineConfig } from 'vitest/config';

/**
 * Root Vitest configuration for the intentional-cognition-os monorepo.
 *
 * Used by `pnpm test:coverage` to collect unified cross-package coverage.
 * Individual package `pnpm test` commands continue to run per-package via
 * `pnpm -r test` and do not require this file.
 *
 * Coverage thresholds are configured at their target values but currently
 * set to 0 (reporting-only mode) because packages are scaffolds. Raise each
 * threshold to its target once the package reaches that coverage level:
 *
 *   packages/types    target: 100% (statements/branches/functions/lines)
 *   packages/kernel   target:  90%
 *   packages/compiler target:  80%
 *   packages/cli      target:  70%
 */
export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.test.ts',
      'tests/integration/**/*.test.ts',
    ],
    exclude: [
      'evals/**',
      '**/dist/**',
      '**/node_modules/**',
    ],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.d.ts',
        '**/dist/**',
        '**/node_modules/**',
      ],
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        // packages/types — target 100%, currently reporting-only (0)
        'packages/types/src': {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
        // packages/kernel — target 90%, currently reporting-only (0)
        'packages/kernel/src': {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
        // packages/compiler — target 80%, currently reporting-only (0)
        'packages/compiler/src': {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
        // packages/cli — target 70%, currently reporting-only (0)
        'packages/cli/src': {
          statements: 0,
          branches: 0,
          functions: 0,
          lines: 0,
        },
      },
    },
  },
});
