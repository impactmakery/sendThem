import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { validateCampaignName, CAMPAIGN_NOTES_MAX_LENGTH } from '@repo/shared';

export const dynamic = 'force-dynamic';

/**
 * GET /api/campaigns
 * List all campaigns for the authenticated user, ordered by created_at desc.
 */
export async function GET() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select('id, name, status, recipient_count, sent_count, scheduled_at, send_completed_at, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }

  // Map snake_case DB columns to camelCase for the frontend
  const mapped = (campaigns ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    recipientCount: c.recipient_count,
    sentCount: c.sent_count,
    scheduledAt: c.scheduled_at,
    sendCompletedAt: c.send_completed_at,
    createdAt: c.created_at,
  }));

  return NextResponse.json({
    campaigns: mapped,
    total: mapped.length,
    page: 1,
    limit: mapped.length,
  });
}

/**
 * POST /api/campaigns
 * Create a new draft campaign for the authenticated user.
 */
export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { name?: string; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { name, notes } = body;

  // Validate name
  if (!name) {
    return NextResponse.json({ error: 'Campaign name is required' }, { status: 400 });
  }

  const nameError = validateCampaignName(name);
  if (nameError) {
    return NextResponse.json({ error: nameError }, { status: 400 });
  }

  // Validate notes length
  if (notes && notes.length > CAMPAIGN_NOTES_MAX_LENGTH) {
    return NextResponse.json(
      { error: `Notes must be ${CAMPAIGN_NOTES_MAX_LENGTH} characters or less` },
      { status: 400 }
    );
  }

  const { data: campaign, error } = await supabase
    .from('campaigns')
    .insert({
      user_id: user.id,
      name: name.trim(),
      notes: notes?.trim() || null,
      status: 'draft',
    })
    .select('id, name, notes, status, created_at')
    .single();

  if (error) {
    console.error('Failed to create campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }

  return NextResponse.json({
    id: campaign.id,
    name: campaign.name,
    notes: campaign.notes,
    status: campaign.status,
    createdAt: campaign.created_at,
  }, { status: 201 });
}
