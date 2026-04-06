import { describe, it, expect } from 'vitest';
import { ok, err, isOk, isErr } from './result.js';

describe('Result type', () => {
  it('ok() creates a success result', () => {
    const result = ok(42);
    expect(result.ok).toBe(true);
    expect(isOk(result)).toBe(true);
    expect(isErr(result)).toBe(false);
    if (isOk(result)) {
      expect(result.value).toBe(42);
    }
  });

  it('err() creates a failure result', () => {
    const result = err(new Error('fail'));
    expect(result.ok).toBe(false);
    expect(isOk(result)).toBe(false);
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error.message).toBe('fail');
    }
  });

  it('works with string error types', () => {
    const result = err('not found');
    expect(isErr(result)).toBe(true);
    if (isErr(result)) {
      expect(result.error).toBe('not found');
    }
  });
});
