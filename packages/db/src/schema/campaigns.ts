import { pgTable, uuid, varchar, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { users } from './users';

export const campaigns = pgTable('campaigns', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  name: varchar('name', { length: 80 }).notNull(),
  notes: varchar('notes', { length: 500 }),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  metaTemplateId: varchar('meta_template_id', { length: 255 }),
  metaTemplateName: varchar('meta_template_name', { length: 255 }),
  templateBody: text('template_body'),
  templateStatus: varchar('template_status', { length: 30 }),
  variableMapping: jsonb('variable_mapping').$type<Record<string, string>>(),
  rejectionReason: text('rejection_reason'),
  recipientCount: integer('recipient_count').notNull().default(0),
  validCount: integer('valid_count').notNull().default(0),
  sentCount: integer('sent_count').notNull().default(0),
  deliveredCount: integer('delivered_count').notNull().default(0),
  readCount: integer('read_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  sendStartedAt: timestamp('send_started_at', { withTimezone: true }),
  sendCompletedAt: timestamp('send_completed_at', { withTimezone: true }),
  complianceDeclaredAt: timestamp('compliance_declared_at', { withTimezone: true }),
  filePath: varchar('file_path', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
