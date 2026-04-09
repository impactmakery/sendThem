import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  packName: varchar('pack_name', { length: 20 }).notNull(),
  credits: integer('credits').notNull(),
  amountIls: integer('amount_ils').notNull(), // in agorot
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  invoiceUrl: varchar('invoice_url', { length: 500 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
