import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/campaigns/[id]/recipients
 *
 * Paginated list of recipients for a campaign.
 * Query params:
 *   - page (default 1)
 *   - limit (default 50, max 200)
 *   - filter: "all" | "valid" | "invalid" | "duplicate" (default "all")
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id: campaignId } = await params;
  const supabase = await createSupabaseServer();

  // ── Auth ──────────────────────────────────────────────
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── Verify campaign ownership ─────────────────────────
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id')
    .eq('id', campaignId)
    .eq('user_id', user.id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  // ── Parse query params ────────────────────────────────
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
  const filter = searchParams.get('filter') || 'all';
  const offset = (page - 1) * limit;

  // ── Build query ───────────────────────────────────────
  let query = supabase
    .from('recipients')
    .select('id, phone_number, original_phone, variables, is_valid, validation_error, is_duplicate, was_auto_corrected, created_at', { count: 'exact' })
    .eq('campaign_id', campaignId)
    .order('created_at', { ascending: true });

  switch (filter) {
    case 'valid':
      query = query.eq('is_valid', true).eq('is_duplicate', false);
      break;
    case 'invalid':
      query = query.eq('is_valid', false);
      break;
    case 'duplicate':
      query = query.eq('is_duplicate', true);
      break;
    // 'all' — no extra filter
  }

  query = query.range(offset, offset + limit - 1);

  const { data: recipients, error: fetchError, count } = await query;

  if (fetchError) {
    console.error('Failed to fetch recipients:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch recipients' }, { status: 500 });
  }

  // Map to camelCase
  const mapped = (recipients ?? []).map((r) => ({
    id: r.id,
    phoneNumber: r.phone_number,
    originalPhone: r.original_phone,
    variables: r.variables,
    isValid: r.is_valid,
    validationError: r.validation_error,
    isDuplicate: r.is_duplicate,
    wasAutoCorrected: r.was_auto_corrected,
    createdAt: r.created_at,
  }));

  return NextResponse.json({
    recipients: mapped,
    total: count ?? 0,
    page,
    limit,
    totalPages: count ? Math.ceil(count / limit) : 0,
  });
}
