import * as fs from 'fs';
import { TemplateFileNotFoundError } from '../errors';

interface CommandNewOptions {
  migrationsDir: string;
  migrationName: string;
  templateFile?: string;
}

export const defaultDescription = 'Change me!';

export const defaultMigrationTemplate = (className: string) => {
  return `import { MigrationInterface } from '@frabbit/mongo-migrate-ts'
import { Db } from 'mongodb'

export class ${className} implements MigrationInterface {
  description = '${defaultDescription}'

  public async up(db: Db): Promise<any> {
    // TODO: Implement migration
  }

  public async down(db: Db): Promise<any> {
    // TODO: Implement rollback
  }
}
`;
};

export const getMigrationTemplate = (
  className: string,
  templateFile?: string
): string => {
  if (!templateFile) {
    return defaultMigrationTemplate(className);
  }

  if (fs.existsSync(templateFile)) {
    const template: string = fs.readFileSync(templateFile).toString();
    return template.replace(/class (\S*) /, `class ${className} `);
  }

  throw new TemplateFileNotFoundError(
    `Template file ${templateFile} not found`
  );
};

export const newCommand = (opts: CommandNewOptions): string => {
  const { migrationName, migrationsDir, templateFile } = opts;

  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir);
  }
  const fileName = `${+new Date()}-${migrationName}`;

  const pascalCased = migrationName
    .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
    .replace(/[^A-z0-9]+/g, '');
  const className = `Migration${pascalCased}${+new Date()}`;

  const template = getMigrationTemplate(className, templateFile);

  const migrationPath = `${migrationsDir}/${fileName}.ts`;

  fs.writeFileSync(migrationPath, template);

  return migrationPath;
};
