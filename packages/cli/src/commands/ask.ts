import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('ask <question>')
    .description('Ask a question about your knowledge (Epic 7)')
    .action(() => {
      console.error('Not yet implemented. See Epic 7: Query & Lint.');
      process.exit(1);
    });
}
