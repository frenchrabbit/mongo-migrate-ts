import { Command } from 'commander';
import { down } from './commands/down';
import { init } from './commands/init';
import { newCommand } from './commands/new';
import { status } from './commands/status';
import { up } from './commands/up';
import { Config } from './config';

export const cli = (config?: Config): void => {
  const program = new Command();
  if (!config) {
    console.log('No config found. Please run `init` before continuing');
  }

  program
    .command('init')
    .description('Creates the migrations directory and configuration file')
    .action(() => {
      init();
    });
  if (config) {
    program
      .command('create')
      .description('Create a new migration file under migrations directory')
      .storeOptionsAsProperties(false)
      .argument('<name>', 'the migration name')
      .option('-t, --template-file <path>', 'The template file to use')
      .action((migrationName, opts) => {
        let templateFile = opts.templateFile;

        if (
          typeof opts.templateFile !== 'string' ||
          opts.templateFile.length === 0
        ) {
          templateFile = undefined;
        }

        newCommand({
          migrationName,
          migrationsDir: config.migrationsDir,
          templateFile: templateFile,
        });
      });

    program
      .command('up')
      .description('Run all pending migrations')
      .action(async () => {
        try {
          await up({ config });
        } catch (e) {
          console.error(e);
          process.exitCode = 1;
        } finally {
          process.exit();
        }
      });

    program
      .command('down')
      .description('Undo migrations')
      .option('-l, --last', 'Undo the last applied migration')
      .option('-a, --all', 'Undo all applied migrations')
      .action((opts) => {
        if (!opts.last && !opts.all) {
          program.outputHelp();
          process.exit(-1);
        }

        down({
          config,
          mode: opts.last ? 'last' : 'all',
        });
      });

    program
      .command('status')
      .description('Show the status of the migrations')
      .action(() => {
        status({ config });
      });
  }

  program.parse();
};
