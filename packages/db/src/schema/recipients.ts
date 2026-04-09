import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { campaigns } from './campaigns';

export const recipients = pgTable(
  'recipients',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
    originalPhone: varchar('original_phone', { length: 50 }),
    variables: jsonb('variables').$type<Record<string, string>>(),
    isValid: boolean('is_valid').notNull().default(true),
    validationError: varchar('validation_error', { length: 255 }),
    isDuplicate: boolean('is_duplicate').notNull().default(false),
    wasAutoCorrected: boolean('was_auto_corrected').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_recipients_campaign_valid').on(table.campaignId).where(
      sql`${table.isValid} = true AND ${table.isDuplicate} = false`
    ),
  ]
);
