import type { FastifyInstance } from 'fastify';
import { eq, desc } from 'drizzle-orm';
import { creditTransactions } from '@repo/db';
import { getDb } from '../lib/db';
import { requireAuth } from '../middleware/auth';

export async function creditRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // Get credit transaction history
  app.get('/credits/history', async (request) => {
    const db = getDb();
    const userId = (request as any).userId;
    const query = request.query as { limit?: string };
    const limit = Math.min(100, parseInt(query.limit || '20'));

    const transactions = await db
      .select()
      .from(creditTransactions)
      .where(eq(creditTransactions.userId, userId))
      .orderBy(desc(creditTransactions.createdAt))
      .limit(limit);

    return { transactions };
  });
}
