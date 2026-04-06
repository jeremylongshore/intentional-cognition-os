import { Command } from 'commander';
import { version } from '@ico/kernel';

const program = new Command();

program
  .name('ico')
  .description('Intentional Cognition OS — Compile knowledge for the machine. Distill understanding for the human.')
  .version(version);

program.parse();
