import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLogger, Logger } from './logger.js';

describe('Logger', () => {
  let consoleSpy: { log: ReturnType<typeof vi.spyOn>; info: ReturnType<typeof vi.spyOn>; warn: ReturnType<typeof vi.spyOn>; error: ReturnType<typeof vi.spyOn> };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      info: vi.spyOn(console, 'info').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs at info level by default', () => {
    const logger = createLogger();
    logger.info('hello');
    expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    expect(consoleSpy.info.mock.calls[0]?.[0]).toMatch(/\[INFO\] hello/);
  });

  it('debug messages are suppressed at info level', () => {
    const logger = createLogger('info');
    logger.debug('hidden');
    expect(consoleSpy.log).not.toHaveBeenCalled();
  });

  it('debug messages appear at debug level', () => {
    const logger = createLogger('debug');
    logger.debug('visible');
    expect(consoleSpy.log).toHaveBeenCalledTimes(1);
    expect(consoleSpy.log.mock.calls[0]?.[0]).toMatch(/\[DEBUG\] visible/);
  });

  it('warn and error always appear at info level', () => {
    const logger = createLogger('info');
    logger.warn('warning');
    logger.error('failure');
    expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    expect(consoleSpy.error).toHaveBeenCalledTimes(1);
  });

  it('setLevel changes the threshold', () => {
    const logger = new Logger('error');
    logger.info('hidden');
    expect(consoleSpy.info).not.toHaveBeenCalled();
    logger.setLevel('debug');
    logger.info('visible');
    expect(consoleSpy.info).toHaveBeenCalledTimes(1);
  });

  it('redacts sk-ant- API key patterns', () => {
    const logger = createLogger();
    logger.info('Key is sk-ant-api03-abcdef123456');
    const output = consoleSpy.info.mock.calls[0]?.[0] as string;
    expect(output).not.toContain('sk-ant-api03');
    expect(output).toContain('[REDACTED]');
  });

  it('redacts Bearer tokens', () => {
    const logger = createLogger();
    logger.info('Auth: Bearer eyJhbGciOiJIUzI1NiJ9.token');
    const output = consoleSpy.info.mock.calls[0]?.[0] as string;
    expect(output).not.toContain('eyJhbGci');
    expect(output).toContain('[REDACTED]');
  });

  it('redacts secrets in extra arguments', () => {
    const logger = createLogger();
    logger.info('details:', 'sk-ant-secret-value');
    const args = consoleSpy.info.mock.calls[0];
    expect(args?.[1]).toBe('[REDACTED]');
  });

  it('includes ISO timestamp in output', () => {
    const logger = createLogger();
    logger.info('test');
    const output = consoleSpy.info.mock.calls[0]?.[0] as string;
    expect(output).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});
