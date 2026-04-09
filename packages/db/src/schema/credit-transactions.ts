import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const creditTransactions = pgTable(
  'credit_transactions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    type: varchar('type', { length: 20 }).notNull(), // signup_bonus, purchase, send_deduction, refund
    amount: integer('amount').notNull(), // positive for additions, negative for deductions
    balanceAfter: integer('balance_after').notNull(),
    campaignId: uuid('campaign_id'),
    paymentId: uuid('payment_id'),
    description: varchar('description', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_credit_tx_user').on(table.userId)]
);
