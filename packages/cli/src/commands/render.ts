import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('render <type>')
    .description('Render an artifact (Epic 8)')
    .action(() => {
      console.error('Not yet implemented. See Epic 8: Artifact Renderer.');
      process.exit(1);
    });
}
