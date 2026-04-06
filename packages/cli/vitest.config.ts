import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    testTimeout: 10_000,
    hookTimeout: 10_000,
    server: {
      deps: {
        // better-sqlite3 is a native CJS addon — let Node require it directly
        // rather than letting Vite's SSR transform rewrite the module, which
        // breaks the constructor when the module uses `module.exports = fn`.
        external: ['better-sqlite3'],
      },
    },
  },
});
