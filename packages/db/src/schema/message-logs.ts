import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { campaigns } from './campaigns';
import { recipients } from './recipients';

export const messageLogs = pgTable(
  'message_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    campaignId: uuid('campaign_id')
      .notNull()
      .references(() => campaigns.id),
    recipientId: uuid('recipient_id')
      .notNull()
      .references(() => recipients.id),
    metaMessageId: varchar('meta_message_id', { length: 255 }),
    status: varchar('status', { length: 20 }).notNull().default('queued'),
    failureReason: text('failure_reason'),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    readAt: timestamp('read_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_message_logs_campaign').on(table.campaignId),
    index('idx_message_logs_meta_id').on(table.metaMessageId),
  ]
);
