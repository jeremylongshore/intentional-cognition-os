import { execFileSync } from 'node:child_process';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { version } from '@ico/kernel';

import { buildProgram } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// dist/index.js lives at packages/cli/dist/index.js (one level up from src/)
const distIndex = join(__dirname, '..', 'dist', 'index.js');

const ALL_COMMANDS = [
  'init',
  'ingest',
  'mount',
  'compile',
  'ask',
  'research',
  'render',
  'lint',
  'recall',
  'promote',
  'status',
  'eval',
  'inspect',
] as const;

describe('cli program structure', () => {
  it('registers all expected commands', () => {
    const p = buildProgram();
    const registered = p.commands.map((c) => c.name());
    for (const name of ALL_COMMANDS) {
      expect(registered).toContain(name);
    }
  });

  it('has all global options in help output', () => {
    const p = buildProgram();
    const helpText = p.helpInformation();
    expect(helpText).toContain('--workspace');
    expect(helpText).toContain('--verbose');
    expect(helpText).toContain('--quiet');
    expect(helpText).toContain('--json');
  });

  it('all command names appear in help output', () => {
    const p = buildProgram();
    const helpText = p.helpInformation();
    for (const name of ALL_COMMANDS) {
      expect(helpText).toContain(name);
    }
  });

  it('outputs the version string from kernel', () => {
    const p = buildProgram();
    p.exitOverride();
    let output = '';
    p.configureOutput({
      writeOut: (str) => {
        output += str;
      },
    });
    try {
      p.parse(['node', 'ico', '--version']);
    } catch {
      // exitOverride causes Commander to throw instead of calling process.exit
    }
    expect(output.trim()).toBe(version);
  });

  it('help text contains the program description', () => {
    const p = buildProgram();
    const helpText = p.helpInformation();
    expect(helpText).toContain('ico');
    expect(helpText).toContain('Compile knowledge for the machine');
  });
});

describe('cli kernel version', () => {
  it('kernel version is a semver string', () => {
    expect(typeof version).toBe('string');
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });
});

describe('stub command exit codes', () => {
  function runCli(args: string[]): { stdout: string; stderr: string; status: number } {
    try {
      const stdout = execFileSync('node', [distIndex, ...args], {
        encoding: 'utf8',
        timeout: 5000,
      });
      return { stdout, stderr: '', status: 0 };
    } catch (err: unknown) {
      const e = err as { stdout?: string; stderr?: string; status?: number };
      return {
        stdout: e.stdout ?? '',
        stderr: e.stderr ?? '',
        status: e.status ?? 1,
      };
    }
  }

  it('ico --help exits 0 and lists all commands', () => {
    const result = runCli(['--help']);
    expect(result.status).toBe(0);
    for (const name of ALL_COMMANDS) {
      expect(result.stdout).toContain(name);
    }
  });

  it('ico --version exits 0 and outputs version', () => {
    const result = runCli(['--version']);
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe(version);
  });

  it('ico compile exits 1 and mentions Epic 6', () => {
    const result = runCli(['compile']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 6');
  });

  it('ico ask exits 1 and mentions Epic 7', () => {
    const result = runCli(['ask', 'what is knowledge?']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 7');
  });

  it('ico research exits 1 and mentions Epic 9', () => {
    const result = runCli(['research', 'brief']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 9');
  });

  it('ico render exits 1 and mentions Epic 8', () => {
    const result = runCli(['render', 'report']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 8');
  });

  it('ico lint exits 1 and mentions Epic 7', () => {
    const result = runCli(['lint']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 7');
  });

  it('ico recall exits 1 and mentions Epic 9', () => {
    const result = runCli(['recall', 'list']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 9');
  });

  it('ico promote exits 1 and mentions Epic 8', () => {
    const result = runCli(['promote', 'some/path']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 8');
  });

  it('ico eval exits 1 and mentions Epic 10', () => {
    const result = runCli(['eval', 'spec.yaml']);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('Epic 10');
  });
});
