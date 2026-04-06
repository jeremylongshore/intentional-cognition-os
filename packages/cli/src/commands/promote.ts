import type { Command } from 'commander';

export function register(program: Command): void {
  program
    .command('promote <path>')
    .description('Promote an artifact to L2 (Epic 8)')
    .action(() => {
      console.error('Not yet implemented. See Epic 8: Artifact Renderer.');
      process.exit(1);
    });
}
