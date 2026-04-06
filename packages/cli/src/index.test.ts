import { describe, it, expect } from 'vitest';
import { version } from '@ico/kernel';

describe('cli', () => {
  it('imports kernel version', () => {
    expect(typeof version).toBe('string');
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
