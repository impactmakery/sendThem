import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';
import { normalizeIsraeliPhone } from '@repo/shared';
import { MAX_EXCEL_ROWS, MAX_EXCEL_FILE_SIZE } from '@repo/shared';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** Column names that likely contain phone numbers (case-insensitive). */
const PHONE_COLUMN_NAMES = [
  'phone',
  'phone_number',
  'phonenumber',
  'mobile',
  'tel',
  'telephone',
  'cell',
  'cellphone',
  'whatsapp',
  'טלפון',
  'נייד',
  'טל',
  'מספר טלפון',
  'פלאפון',
];

/** Regex to detect values that look like phone numbers. */
const PHONE_VALUE_PATTERN = /^[\s+]?[\d\s\-()]{7,15}$/;

/**
 * Auto-detect which column contains phone numbers.
 * First checks column names, then falls back to value-based detection.
 */
function detectPhoneColumn(
  headers: string[],
  sampleRows: Record<string, unknown>[]
): string | null {
  // 1. Match by column name
  for (const header of headers) {
    const lower = header.toLowerCase().trim();
    if (PHONE_COLUMN_NAMES.includes(lower)) {
      return header;
    }
  }

  // 2. Fall back: check which column has the most phone-like values
  let bestCol: string | null = null;
  let bestScore = 0;

  for (const header of headers) {
    let score = 0;
    for (const row of sampleRows) {
      const val = String(row[header] ?? '').trim();
      if (val && PHONE_VALUE_PATTERN.test(val)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCol = header;
    }
  }

  // Require at least 50% match in sample
  if (bestCol && bestScore >= Math.ceil(sampleRows.length * 0.5)) {
    return bestCol;
  }

  return null;
}

/**
 * POST /api/campaigns/[id]/upload
 *
 * Accept an Excel file, parse it, normalize phones, insert recipients,
 * and return a validation summary.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
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

  // ── Verify campaign ownership + draft status ──────────
  const { data: campaign, error: campaignError } = await supabase
    .from('campaigns')
    .select('id, user_id, status')
    .eq('id', campaignId)
    .eq('user_id', user.id)
    .single();

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  if (campaign.status !== 'draft') {
    return NextResponse.json(
      { error: 'Can only upload recipients to a draft campaign' },
      { status: 400 }
    );
  }

  // ── Parse multipart form data ─────────────────────────
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > MAX_EXCEL_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10 MB.' }, { status: 400 });
  }

  // ── Read & parse Excel ────────────────────────────────
  let rows: Record<string, unknown>[];
  let headers: string[];

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json({ error: 'Excel file has no sheets' }, { status: 400 });
    }

    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  } catch {
    return NextResponse.json({ error: 'Failed to parse file. Please upload a valid Excel or CSV file.' }, { status: 400 });
  }

  if (rows.length === 0) {
    return NextResponse.json({ error: 'File has no data rows' }, { status: 400 });
  }

  if (rows.length > MAX_EXCEL_ROWS) {
    return NextResponse.json(
      { error: `File has ${rows.length.toLocaleString()} rows. Maximum is ${MAX_EXCEL_ROWS.toLocaleString()}.` },
      { status: 400 }
    );
  }

  // ── Detect phone column ───────────────────────────────
  const sampleForDetection = rows.slice(0, Math.min(20, rows.length));
  const phoneColumn = detectPhoneColumn(headers, sampleForDetection);

  if (!phoneColumn) {
    return NextResponse.json(
      {
        error:
          'Could not detect a phone number column. Please name it "phone", "phone_number", "mobile", "טלפון", or "נייד".',
      },
      { status: 400 }
    );
  }

  // ── Process each row ──────────────────────────────────
  const seenPhones = new Set<string>();
  const recipientBatches: Array<{
    campaign_id: string;
    phone_number: string;
    original_phone: string;
    variables: Record<string, string>;
    is_valid: boolean;
    validation_error: string | null;
    is_duplicate: boolean;
    was_auto_corrected: boolean;
  }> = [];

  let validCount = 0;
  let invalidCount = 0;
  let duplicateCount = 0;
  let autoCorrectCount = 0;
  const invalidReasons: Record<string, number> = {};

  // Non-phone columns become personalization variables
  const variableColumns = headers.filter((h) => h !== phoneColumn);

  for (const row of rows) {
    const rawPhone = String(row[phoneColumn] ?? '').trim();

    // Build variables object from non-phone columns
    const variables: Record<string, string> = {};
    for (const col of variableColumns) {
      variables[col] = String(row[col] ?? '').trim();
    }

    // Normalize & validate phone
    const result = normalizeIsraeliPhone(rawPhone);

    if (!result.isValid || !result.normalized) {
      invalidCount++;
      const reason = result.error || 'Invalid phone number format';
      invalidReasons[reason] = (invalidReasons[reason] || 0) + 1;

      recipientBatches.push({
        campaign_id: campaignId,
        phone_number: rawPhone,
        original_phone: rawPhone,
        variables,
        is_valid: false,
        validation_error: reason,
        is_duplicate: false,
        was_auto_corrected: false,
      });
      continue;
    }

    // Check duplicates
    if (seenPhones.has(result.normalized)) {
      duplicateCount++;
      recipientBatches.push({
        campaign_id: campaignId,
        phone_number: result.normalized,
        original_phone: rawPhone,
        variables,
        is_valid: true,
        validation_error: null,
        is_duplicate: true,
        was_auto_corrected: result.wasAutoCorrected,
      });
      continue;
    }

    seenPhones.add(result.normalized);
    validCount++;
    if (result.wasAutoCorrected) autoCorrectCount++;

    recipientBatches.push({
      campaign_id: campaignId,
      phone_number: result.normalized,
      original_phone: rawPhone,
      variables,
      is_valid: true,
      validation_error: null,
      is_duplicate: false,
      was_auto_corrected: result.wasAutoCorrected,
    });
  }

  // ── Delete existing recipients for this campaign ──────
  const { error: deleteError } = await supabase
    .from('recipients')
    .delete()
    .eq('campaign_id', campaignId);

  if (deleteError) {
    console.error('Failed to delete old recipients:', deleteError);
    return NextResponse.json({ error: 'Failed to clear existing recipients' }, { status: 500 });
  }

  // ── Batch insert recipients (500 per batch) ───────────
  const BATCH_SIZE = 500;
  for (let i = 0; i < recipientBatches.length; i += BATCH_SIZE) {
    const batch = recipientBatches.slice(i, i + BATCH_SIZE);
    const { error: insertError } = await supabase
      .from('recipients')
      .insert(batch);

    if (insertError) {
      console.error(`Failed to insert batch ${i / BATCH_SIZE + 1}:`, insertError);
      return NextResponse.json(
        { error: 'Failed to save recipients. Please try again.' },
        { status: 500 }
      );
    }
  }

  // ── Update campaign counts ────────────────────────────
  await supabase
    .from('campaigns')
    .update({
      recipient_count: rows.length,
      valid_count: validCount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', campaignId)
    .eq('user_id', user.id);

  // ── Build response ────────────────────────────────────
  // Rename phone column to "phone_number" in output columns + sample rows
  const detectedColumns = [
    'phone_number',
    ...variableColumns,
  ];

  const sampleRows = rows.slice(0, 5).map((row) => {
    const mapped: Record<string, string> = {};
    const rawPhone = String(row[phoneColumn] ?? '').trim();
    const normalized = normalizeIsraeliPhone(rawPhone);
    mapped['phone_number'] = normalized.normalized || rawPhone;
    for (const col of variableColumns) {
      mapped[col] = String(row[col] ?? '').trim();
    }
    return mapped;
  });

  const invalidReasonsArray = Object.entries(invalidReasons).map(
    ([reason, count]) => ({ reason, count })
  );

  const summary = {
    totalRows: rows.length,
    validCount,
    invalidCount,
    duplicateCount,
    autoCorrectCount,
    detectedColumns,
    sampleRows,
    invalidReasons: invalidReasonsArray,
  };

  return NextResponse.json(summary);
}
