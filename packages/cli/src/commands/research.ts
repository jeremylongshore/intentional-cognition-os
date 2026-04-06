import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('research <brief>')
    .description('Start a research task (Epic 9)')
    .action(() => {
      console.error('Not yet implemented. See Epic 9: Multi-Agent Research.');
      process.exit(1);
    });
}
