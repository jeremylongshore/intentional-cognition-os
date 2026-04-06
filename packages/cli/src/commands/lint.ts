import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('lint')
    .description('Lint knowledge for issues (Epic 7)')
    .action(() => {
      console.error('Not yet implemented. See Epic 7: Query & Lint.');
      process.exit(1);
    });
}
