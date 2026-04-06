import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import { createLogger, Logger } from './logger.js';

type ConsoleSpy = MockInstance<(...args: unknown[]) => void>;

function getCallArg(spy: ConsoleSpy, callIndex: number, argIndex: number): unknown {
  return spy.mock.calls[callIndex]?.[argIndex];
}

describe('Logger', () => {
  let logSpy: ConsoleSpy;
  let infoSpy: ConsoleSpy;
  let warnSpy: ConsoleSpy;
  let errorSpy: ConsoleSpy;

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs at info level by default', () => {
    const logger = createLogger();
    logger.info('hello');
    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(getCallArg(infoSpy, 0, 0)).toMatch(/\[INFO\] hello/);
  });

  it('debug messages are suppressed at info level', () => {
    const logger = createLogger('info');
    logger.debug('hidden');
    expect(logSpy).not.toHaveBeenCalled();
  });

  it('debug messages appear at debug level', () => {
    const logger = createLogger('debug');
    logger.debug('visible');
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(getCallArg(logSpy, 0, 0)).toMatch(/\[DEBUG\] visible/);
  });

  it('warn and error always appear at info level', () => {
    const logger = createLogger('info');
    logger.warn('warning');
    logger.error('failure');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('setLevel changes the threshold', () => {
    const logger = new Logger('error');
    logger.info('hidden');
    expect(infoSpy).not.toHaveBeenCalled();
    logger.setLevel('debug');
    logger.info('visible');
    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('redacts sk-ant- API key patterns', () => {
    const logger = createLogger();
    logger.info('Key is sk-ant-api03-abcdef123456');
    const output = String(getCallArg(infoSpy, 0, 0));
    expect(output).not.toContain('sk-ant-api03');
    expect(output).toContain('[REDACTED]');
  });

  it('redacts Bearer tokens', () => {
    const logger = createLogger();
    logger.info('Auth: Bearer eyJhbGciOiJIUzI1NiJ9.token');
    const output = String(getCallArg(infoSpy, 0, 0));
    expect(output).not.toContain('eyJhbGci');
    expect(output).toContain('[REDACTED]');
  });

  it('redacts secrets in extra arguments', () => {
    const logger = createLogger();
    logger.info('details:', 'sk-ant-secret-value');
    expect(getCallArg(infoSpy, 0, 1)).toBe('[REDACTED]');
  });

  it('redacts secrets in object arguments', () => {
    const logger = createLogger();
    logger.info('context:', { apiKey: 'sk-ant-api03-secret', user: 'alice' });
    const redacted = getCallArg(infoSpy, 0, 1) as Record<string, unknown>;
    expect(redacted['apiKey']).toBe('[REDACTED]');
    expect(redacted['user']).toBe('alice');
  });

  it('includes ISO timestamp in output', () => {
    const logger = createLogger();
    logger.info('test');
    const output = String(getCallArg(infoSpy, 0, 0));
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
