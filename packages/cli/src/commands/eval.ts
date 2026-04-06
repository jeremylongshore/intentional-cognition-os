import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('eval <spec>')
    .description('Run evaluation specs (Epic 10)')
    .action(() => {
      console.error('Not yet implemented. See Epic 10: Evals & Observability.');
      process.exit(1);
    });
}
