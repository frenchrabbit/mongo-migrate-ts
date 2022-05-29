import { Db } from 'mongodb';

export interface MigrationInterface {
  description: string;

  up(db: Db): Promise<any>;
  down(db: Db): Promise<any>;
}
