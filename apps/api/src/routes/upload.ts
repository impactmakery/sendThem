import type { FastifyInstance } from 'fastify';
import { eq, and, sql } from 'drizzle-orm';
import { campaigns, recipients } from '@repo/db';
import { normalizeIsraeliPhone, MAX_EXCEL_ROWS, MAX_EXCEL_FILE_SIZE } from '@repo/shared';
import { getDb } from '../lib/db';
import { requireAuth } from '../middleware/auth';
import * as XLSX from 'xlsx';

export async function uploadRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // Upload and parse Excel file
  app.post('/campaigns/:id/upload', async (request, reply) => {
    const db = getDb();
    const userId = (request as any).userId;
    const { id } = request.params as { id: string };

    // Verify campaign ownership and draft status
    const [campaign] = await db
      .select()
      .from(campaigns)
      .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
      .limit(1);

    if (!campaign) {
      return reply.status(404).send({ error: 'Campaign not found' });
    }
    if (campaign.status !== 'draft') {
      return reply.status(400).send({ error: 'Can only upload to draft campaigns' });
    }

    // Get uploaded file
    const data = await request.file();
    if (!data) {
      return reply.status(400).send({ error: 'No file uploaded' });
    }

    const buffer = await data.toBuffer();

    if (buffer.length > MAX_EXCEL_FILE_SIZE) {
      return reply.status(400).send({ error: 'File is too large. Maximum size is 10 MB.' });
    }

    // Parse with SheetJS
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      return reply.status(400).send({ error: 'Could not parse file. Please upload a valid .xlsx, .xls, or .csv file.' });
    }

    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return reply.status(400).send({ error: 'File contains no sheets.' });
    }

    const rows: Record<string, any>[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (rows.length === 0) {
      return reply.status(400).send({ error: 'This file is empty. Please upload a file with at least one row of recipient data.' });
    }
    if (rows.length > MAX_EXCEL_ROWS) {
      return reply.status(400).send({ error: `File has ${rows.length} rows. Maximum is ${MAX_EXCEL_ROWS}.` });
    }

    // Detect columns
    const detectedColumns = Object.keys(rows[0]);

    // Find phone column (flexible matching)
    const phoneColName = detectedColumns.find((c) =>
      /phone|tel|mobile|נייד|טלפון/i.test(c)
    );
    if (!phoneColName) {
      return reply.status(400).send({
        error: 'No phone number column found. The file must have a column named "phone", "phone_number", "mobile", or "tel".',
      });
    }

    // Process each row
    const seen = new Set<string>();
    let validCount = 0;
    let invalidCount = 0;
    let duplicateCount = 0;
    let autoCorrectCount = 0;
    const invalidReasons: Record<string, number> = {};
    const recipientRows: {
      phoneNumber: string;
      originalPhone: string;
      variables: Record<string, string>;
      isValid: boolean;
      validationError: string | null;
      isDuplicate: boolean;
      wasAutoCorrected: boolean;
    }[] = [];

    for (const row of rows) {
      const rawPhone = String(row[phoneColName] || '').trim();
      const result = normalizeIsraeliPhone(rawPhone);

      // Build variables (all columns except phone)
      const variables: Record<string, string> = {};
      for (const col of detectedColumns) {
        if (col !== phoneColName) {
          variables[col] = String(row[col] ?? '');
        }
      }

      if (!result.isValid) {
        invalidCount++;
        const reason = result.error || 'Invalid phone format';
        invalidReasons[reason] = (invalidReasons[reason] || 0) + 1;
        recipientRows.push({
          phoneNumber: rawPhone,
          originalPhone: rawPhone,
          variables,
          isValid: false,
          validationError: reason,
          isDuplicate: false,
          wasAutoCorrected: false,
        });
        continue;
      }

      const normalized = result.normalized!;
      if (seen.has(normalized)) {
        duplicateCount++;
        recipientRows.push({
          phoneNumber: normalized,
          originalPhone: rawPhone,
          variables,
          isValid: true,
          validationError: null,
          isDuplicate: true,
          wasAutoCorrected: result.wasAutoCorrected,
        });
        continue;
      }

      seen.add(normalized);
      if (result.wasAutoCorrected) autoCorrectCount++;
      validCount++;
      recipientRows.push({
        phoneNumber: normalized,
        originalPhone: rawPhone,
        variables,
        isValid: true,
        validationError: null,
        isDuplicate: false,
        wasAutoCorrected: result.wasAutoCorrected,
      });
    }

    // Delete old recipients for this campaign, then bulk insert
    await db.delete(recipients).where(eq(recipients.campaignId, id));

    // Insert in batches of 500
    for (let i = 0; i < recipientRows.length; i += 500) {
      const batch = recipientRows.slice(i, i + 500);
      await db.insert(recipients).values(
        batch.map((r) => ({
          campaignId: id,
          phoneNumber: r.phoneNumber,
          originalPhone: r.originalPhone,
          variables: r.variables,
          isValid: r.isValid,
          validationError: r.validationError,
          isDuplicate: r.isDuplicate,
          wasAutoCorrected: r.wasAutoCorrected,
        }))
      );
    }

    // Update campaign counts
    await db
      .update(campaigns)
      .set({
        recipientCount: rows.length,
        validCount,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id));

    // Build sample rows (first 5 valid non-duplicate)
    const sampleRows = recipientRows
      .filter((r) => r.isValid && !r.isDuplicate)
      .slice(0, 5)
      .map((r) => ({
        [phoneColName]: r.phoneNumber,
        ...r.variables,
      }));

    return {
      totalRows: rows.length,
      validCount,
      invalidCount,
      duplicateCount,
      autoCorrectCount,
      detectedColumns,
      sampleRows,
      invalidReasons: Object.entries(invalidReasons).map(([reason, count]) => ({ reason, count })),
    };
  });
}
