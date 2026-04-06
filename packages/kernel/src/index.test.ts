import { describe, it, expect } from 'vitest';
import { version } from './index.js';

describe('kernel', () => {
  it('exports a version string', () => {
    expect(version).toBe('0.1.0');
  });
});
