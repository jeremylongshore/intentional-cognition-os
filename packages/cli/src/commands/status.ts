import type { Command } from 'commander';

// TODO: implement in E4-B05
export function register(program: Command): void {
  program
    .command('status')
    .description('Show workspace status')
    .action(() => {
      console.error('Not yet implemented. See E4-B05: Status Command.');
      process.exit(1);
    });
}
