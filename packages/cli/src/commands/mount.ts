import type { Command } from 'commander';

// TODO: implement in E4-B03
export function register(program: Command): void {
  program
    .command('mount <subcommand>')
    .description('Manage corpus mount points')
    .action(() => {
      console.error('Not yet implemented. See E4-B03: Mount Command.');
      process.exit(1);
    });
}
