import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import { users } from '@repo/db';
import { getDb } from '../lib/db';
import { requireAuth } from '../middleware/auth';

export async function meRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  app.get('/me', async (request) => {
    const db = getDb();
    const userId = (request as any).userId;

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return { error: 'User not found' };
    }

    return {
      id: user.id,
      email: user.email,
      creditBalance: user.creditBalance,
      tosAcceptedAt: user.tosAcceptedAt,
      createdAt: user.createdAt,
    };
  });
}
