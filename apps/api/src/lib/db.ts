import { createDb, type Database } from '@repo/db';
import { getEnv } from '../config/env';

let db: Database;

export function getDb(): Database {
  if (!db) {
    db = createDb(getEnv().DATABASE_URL);
  }
  return db;
}
