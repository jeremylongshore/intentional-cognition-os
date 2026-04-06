import { Command } from 'commander';

import { version } from '@ico/kernel';

import { register as registerAsk } from './commands/ask.js';
import { register as registerCompile } from './commands/compile.js';
import { register as registerEval } from './commands/eval.js';
import { register as registerIngest } from './commands/ingest.js';
import { register as registerInit } from './commands/init.js';
import { register as registerInspect } from './commands/inspect.js';
import { register as registerLint } from './commands/lint.js';
import { register as registerMount } from './commands/mount.js';
import { register as registerPromote } from './commands/promote.js';
import { register as registerRecall } from './commands/recall.js';
import { register as registerRender } from './commands/render.js';
import { register as registerResearch } from './commands/research.js';
import { register as registerStatus } from './commands/status.js';

export function buildProgram(): Command {
  const p = new Command();
  p.name('ico')
    .description(
      'Intentional Cognition OS — Compile knowledge for the machine. Distill understanding for the human.',
    )
    .version(version)
    .option('--workspace <path>', 'Workspace directory')
    .option('--verbose', 'Show debug output')
    .option('--quiet', 'Suppress non-essential output')
    .option('--json', 'Output as JSON');

  registerInit(p);
  registerIngest(p);
  registerMount(p);
  registerCompile(p);
  registerAsk(p);
  registerResearch(p);
  registerRender(p);
  registerLint(p);
  registerRecall(p);
  registerPromote(p);
  registerStatus(p);
  registerEval(p);
  registerInspect(p);

  return p;
}

// Only parse when run directly as the CLI entry point
const isMain =
  process.argv[1] !== undefined &&
  (process.argv[1].endsWith('/index.js') || process.argv[1].endsWith('/ico'));

if (isMain) {
  buildProgram().parse();
}
