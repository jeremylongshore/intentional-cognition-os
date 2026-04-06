import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('compile [target]')
    .description('Compile knowledge from sources (Epic 6)')
    .action(() => {
      console.error('Not yet implemented. See Epic 6: Knowledge Compiler.');
      process.exit(1);
    });
}
