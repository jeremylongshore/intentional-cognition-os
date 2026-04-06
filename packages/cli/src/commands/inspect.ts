import type { Command } from 'commander';

// TODO: implement in E4-B11
export function register(program: Command): void {
  program
    .command('inspect <subcommand>')
    .description('Inspect traces and audit logs')
    .action(() => {
      console.error('Not yet implemented. See E4-B11: Inspect Command.');
      process.exit(1);
    });
}
