import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  dts: true,
  clean: true,
  sourcemap: true,
  bundle: true,
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: ['better-sqlite3'],
});
