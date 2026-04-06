import { describe, it, expect } from 'vitest';
import { version } from './index.js';

describe('compiler', () => {
  it('exports a version string', () => {
    expect(version).toBe('0.1.0');
  });
});
