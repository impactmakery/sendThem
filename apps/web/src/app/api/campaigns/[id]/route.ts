import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import {
  validateCampaignName,
  CAMPAIGN_NOTES_MAX_LENGTH,
  isValidTransition,
  type CampaignStatus,
  CAMPAIGN_STATUSES,
} from '@repo/shared';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/campaigns/[id]
 * Get a single campaign with recipients count and message stats.
 */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Get recipient count from the recipients table
  const { count: recipientCount } = await supabase
    .from('recipients')
    .select('*', { count: 'exact', head: true })
    .eq('campaign_id', id)
    .eq('is_valid', true)
    .eq('is_duplicate', false);

  // Get message stats from message_logs
  const { data: messageLogs } = await supabase
    .from('message_logs')
    .select('status')
    .eq('campaign_id', id);

  const messageStats = {
    queued: 0,
    sent: 0,
    delivered: 0,
    read: 0,
    failed: 0,
  };

  if (messageLogs) {
    for (const log of messageLogs) {
      const status = log.status as keyof typeof messageStats;
      if (status in messageStats) {
        messageStats[status]++;
      }
    }
  }

  return NextResponse.json({
    id: campaign.id,
    userId: campaign.user_id,
    name: campaign.name,
    notes: campaign.notes,
    status: campaign.status,
    metaTemplateId: campaign.meta_template_id,
    metaTemplateName: campaign.meta_template_name,
    templateBody: campaign.template_body,
    variableMapping: campaign.variable_mapping,
    rejectionReason: campaign.rejection_reason,
    recipientCount: recipientCount ?? campaign.recipient_count,
    validCount: campaign.valid_count,
    sentCount: campaign.sent_count,
    deliveredCount: campaign.delivered_count,
    readCount: campaign.read_count,
    failedCount: campaign.failed_count,
    scheduledAt: campaign.scheduled_at,
    sendStartedAt: campaign.send_started_at,
    sendCompletedAt: campaign.send_completed_at,
    complianceDeclaredAt: campaign.compliance_declared_at,
    filePath: campaign.file_path,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at,
    messageStats,
  });
}

/**
 * PATCH /api/campaigns/[id]
 * Update a campaign's name, notes, or status.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    name?: string;
    notes?: string;
    status?: string;
    templateBody?: string;
    variableMapping?: Record<string, string>;
    scheduledAt?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Fetch current campaign to verify ownership and get current status
  const { data: existing, error: fetchError } = await supabase
    .from('campaigns')
    .select('id, user_id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // Build update payload
  const updates: Record<string, unknown> = {};

  // Validate name if provided
  if (body.name !== undefined) {
    const nameError = validateCampaignName(body.name);
    if (nameError) {
      return NextResponse.json({ error: nameError }, { status: 400 });
    }
    updates.name = body.name.trim();
  }

  // Validate notes if provided
  if (body.notes !== undefined) {
    if (body.notes.length > CAMPAIGN_NOTES_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Notes must be ${CAMPAIGN_NOTES_MAX_LENGTH} characters or less` },
        { status: 400 }
      );
    }
    updates.notes = body.notes.trim() || null;
  }

  // Validate status transition if provided
  if (body.status !== undefined) {
    if (!CAMPAIGN_STATUSES.includes(body.status as CampaignStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const currentStatus = existing.status as CampaignStatus;
    const newStatus = body.status as CampaignStatus;

    if (!isValidTransition(currentStatus, newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from '${currentStatus}' to '${newStatus}'` },
        { status: 400 }
      );
    }
    updates.status = newStatus;
  }

  // Template body
  if (body.templateBody !== undefined) {
    updates.template_body = body.templateBody;
  }

  // Variable mapping
  if (body.variableMapping !== undefined) {
    updates.variable_mapping = body.variableMapping;
  }

  // Scheduled at
  if (body.scheduledAt !== undefined) {
    updates.scheduled_at = body.scheduledAt;
  }

  // Set updated_at
  updates.updated_at = new Date().toISOString();

  if (Object.keys(updates).length === 1 && updates.updated_at) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: updated, error: updateError } = await supabase
    .from('campaigns')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('id, name, notes, status, updated_at')
    .single();

  if (updateError) {
    console.error('Failed to update campaign:', updateError);
    return NextResponse.json({ error: 'Failed to update campaign' }, { status: 500 });
  }

  return NextResponse.json({
    id: updated.id,
    name: updated.name,
    notes: updated.notes,
    status: updated.status,
    updatedAt: updated.updated_at,
  });
}

/**
 * DELETE /api/campaigns/[id]
 * Delete a draft campaign. Only draft campaigns can be deleted.
 */
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch campaign to verify ownership and status
  const { data: campaign, error: fetchError } = await supabase
    .from('campaigns')
    .select('id, user_id, status')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  if (campaign.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft campaigns can be deleted' },
      { status: 400 }
    );
  }

  // Delete recipients first (cascade should handle this, but be explicit)
  await supabase
    .from('recipients')
    .delete()
    .eq('campaign_id', id);

  // Delete the campaign
  const { error: deleteError } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    console.error('Failed to delete campaign:', deleteError);
    return NextResponse.json({ error: 'Failed to delete campaign' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
