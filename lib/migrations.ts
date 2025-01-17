import * as fs from 'fs';
import * as path from 'path';
import { MigrationInterface } from './MigrationInterface';
import { flatArray } from './utils/flatArray';
import { isTsNode } from './utils/isTsNode';

export interface MigrationObject {
  file: string;
  className: string;
  description: string;
  instance: MigrationInterface;
}

const isMigration = (obj: any): boolean => {
  return (
    obj &&
    obj.up &&
    obj.down &&
    typeof obj.up === 'function' &&
    typeof obj.down === 'function'
  );
};

export const loadMigrationFile = async (
  filePath: string
): Promise<MigrationObject[]> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File ${filePath} not exists.`);
  }

  const classes = await import(path.resolve(filePath));

  return Object.keys(classes)
    .filter((key: string) => typeof classes[key] === 'function')
    .map((key: string) => {
      const instance = new classes[key]();
      return {
        file: filePath,
        className: key,
        description: instance.description,
        instance,
      };
    })
    .filter((migration: MigrationObject) => isMigration(migration.instance));
};

export const loadMigrations = async (
  migrationsDir: string
): Promise<MigrationObject[]> => {
  const fileExt = isTsNode() ? new RegExp(/\.ts$/i) : new RegExp(/\.js$/i);

  const migrations = Promise.all(
    fs
      .readdirSync(migrationsDir)
      .filter((file: string) => fileExt.test(file))
      .map((file: string) => loadMigrationFile(`${migrationsDir}/${file}`))
  );

  // flat migrations because in one file can be more than one migration
  const flatMigrations = flatArray(await migrations);

  return flatMigrations;
};
