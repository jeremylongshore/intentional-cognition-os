import type { Command } from 'commander';

// TODO: implement in E4-B02
export function register(program: Command): void {
  program
    .command('init <name>')
    .description('Initialize a new workspace')
    .action(() => {
      console.error('Not yet implemented. See E4-B02: Init Command.');
      process.exit(1);
    });
}
