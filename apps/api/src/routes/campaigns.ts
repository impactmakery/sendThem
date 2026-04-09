import type { FastifyInstance } from 'fastify';
import { eq, desc, and, sql } from 'drizzle-orm';
import { campaigns, recipients } from '@repo/db';
import { isValidTransition, type CampaignStatus } from '@repo/shared';
import { getDb } from '../lib/db';
import { requireAuth } from '../middleware/auth';

export async function campaignRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // List campaigns
  app.get('/campaigns', async (request) => {
    const db = getDb();
    const userId = (request as any).userId;
    const query = request.query as { page?: string; limit?: string };
    const page = Math.max(1, parseInt(query.page || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '20')));
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.userId, userId))
      .orderBy(desc(campaigns.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(campaigns)
      .where(eq(campaigns.userId, userId));

    return {
      campaigns: rows,
      total: count,
      page,
      limit,
    };
  });

  // Get single campaign
  app.get('/campaigns/:id', async (request, reply) => {
    const db = getDb();
    const userId = (request as any).userId;
    const { id } = request.params as { id: string };

    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .limit(1);

    if (!campaign) {
      return reply.status(404).send({ error: 'Campaign not found' });
    }

    return campaign;
  });

  // Create campaign
  app.post('/campaigns', async (request) => {
    const db = getDb();
    const userId = (request as any).userId;
    const { name, notes } = request.body as { name: string; notes?: string };

    const [campaign] = await db
      .insert(campaigns)
      .values({
        userId,
        name,
        notes: notes || null,
        status: 'draft',
      })
      .returning();

    return campaign;
  });

  // Update campaign
  app.patch('/campaigns/:id', async (request, reply) => {
    const db = getDb();
    const userId = (request as any).userId;
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, any>;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send({ error: 'Campaign not found' });
    }

    // If status transition requested, validate it
    if (body.status && body.status !== existing.status) {
      if (!isValidTransition(existing.status as CampaignStatus, body.status)) {
        return reply.status(400).send({
          error: `Cannot transition from ${existing.status} to ${body.status}`,
        });
      }
    }

    const updateData: Record<string, any> = { updatedAt: new Date() };
    const allowedFields = [
      'name', 'notes', 'status', 'templateBody', 'variableMapping',
      'scheduledAt', 'complianceDeclaredAt', 'metaTemplateId', 'metaTemplateName',
      'templateStatus', 'rejectionReason',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Convert camelCase to snake_case for DB
        const dbField = field.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
        updateData[dbField] = body[field];
      }
    }

    const [updated] = await db
      .update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, id))
      .returning();

    return updated;
  });

  // Delete campaign (drafts only)
  app.delete('/campaigns/:id', async (request, reply) => {
    const db = getDb();
    const userId = (request as any).userId;
    const { id } = request.params as { id: string };

    const [existing] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .limit(1);

    if (!existing) {
      return reply.status(404).send({ error: 'Campaign not found' });
    }

    if (existing.status !== 'draft') {
      return reply.status(400).send({ error: 'Only draft campaigns can be deleted' });
    }

    await db.delete(campaigns).where(eq(campaigns.id, id));
    return { success: true };
  });

  // Get campaign recipients (for preview)
  app.get('/campaigns/:id/recipients', async (request, reply) => {
    const db = getDb();
    const userId = (request as any).userId;
    const { id } = request.params as { id: string };
    const query = request.query as { limit?: string };
    const limit = Math.min(100, parseInt(query.limit || '10'));

    // Verify ownership
    const [campaign] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .limit(1);

    if (!campaign) {
      return reply.status(404).send({ error: 'Campaign not found' });
    }

    const rows = await db
      .select()
      .from(recipients)
      .where(and(eq(recipients.campaignId, id), eq(recipients.isValid, true), eq(recipients.isDuplicate, false)))
      .limit(limit);

    return { recipients: rows };
  });
}
