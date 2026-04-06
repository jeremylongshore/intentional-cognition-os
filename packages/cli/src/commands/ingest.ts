import type { Command } from 'commander';

// TODO: implement in E4-B04
export function register(program: Command): void {
  program
    .command('ingest <path>')
    .description('Ingest a source file')
    .action(() => {
      console.error('Not yet implemented. See E4-B04: Ingest Command.');
      process.exit(1);
    });
}
