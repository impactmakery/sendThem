import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Schema exports
export * from './schema/users';
export * from './schema/campaigns';
export * from './schema/recipients';
export * from './schema/message-logs';
export * from './schema/credit-transactions';
export * from './schema/payments';

// DB client factory
export function createDb(connectionString: string) {
  const client = postgres(connectionString);
  return drizzle(client);
}

export type Database = ReturnType<typeof createDb>;
