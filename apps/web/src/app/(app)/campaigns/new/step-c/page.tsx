'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StepIndicator } from '@/components/wizard/step-indicator';
import { useWizardStore } from '@/stores/wizard-store';
import { META_TEMPLATE_CHAR_LIMIT } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';
import { nextApiClient } from '@/lib/next-api-client';

export default function StepCPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { campaignId, validation, recipients, templateBody, setTemplate } = useWizardStore();
  const [body, setBody] = useState(templateBody || '');
  const [previewIndex, setPreviewIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const columns = validation?.detectedColumns.filter((c) => c !== 'phone_number') || [];
  const sampleRows = validation?.sampleRows || [];
  const validCount = validation?.validCount || 0;

  // On mount, if campaign has templateBody in store (from resume), pre-fill the editor
  useEffect(() => {
    if (templateBody && !body) {
      setBody(templateBody);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If resuming and no template in store yet, try fetching from API
  useEffect(() => {
    if (campaignId && !templateBody && !body) {
      nextApiClient<{ templateBody: string | null }>(`/campaigns/${campaignId}`)
        .then((data) => {
          if (data.templateBody) {
            setBody(data.templateBody);
          }
        })
        .catch(() => {});
    }
  }, [campaignId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch credit balance
  useEffect(() => {
    fetch('/api/credits/balance')
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => {});
  }, []);

  // Build variable mapping: column name -> {{N}}
  const variableMapping = useMemo(() => {
    const mapping: Record<string, string> = {};
    columns.forEach((col, i) => {
      mapping[`{{${i + 1}}}`] = col;
    });
    return mapping;
  }, [columns]);

  // Resolve preview text by substituting variables
  const previewText = useMemo(() => {
    let text = body;
    columns.forEach((col) => {
      const placeholder = `{{${col}}}`;
      const value = sampleRows[previewIndex]?.[col] || '';
      text = text.replaceAll(placeholder, value);
    });
    return text;
  }, [body, columns, sampleRows, previewIndex]);

  function insertVariable(col: string) {
    setBody((prev) => prev + `{{${col}}}`);
  }

  async function handleSubmit() {
    if (!campaignId) {
      setError('Campaign not found. Please start from Step A.');
      return;
    }

    const metaMapping: Record<string, string> = {};
    columns.forEach((col, i) => {
      metaMapping[String(i + 1)] = col;
    });

    setTemplate(body, metaMapping);
    setSubmitting(true);
    setError(null);

    try {
      // Save template to campaign in DB
      await nextApiClient(`/campaigns/${campaignId}`, {
        method: 'PATCH',
        body: {
          templateBody: body,
          variableMapping: metaMapping,
          status: 'ready_to_send',
        },
      });

      router.push('/campaigns/new/step-d');
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
      setSubmitting(false);
    }
  }

  const isOverLimit = body.length > META_TEMPLATE_CHAR_LIMIT;
  const canSubmit = body.trim().length > 0 && !isOverLimit;
  const hasSufficientCredits = balance !== null && balance >= validCount;

  return (
    <div>
      <StepIndicator currentStep={3} />

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Editor — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6">
              <h2 className="text-xl font-bold text-white">{t('composeMessage')}</h2>
              <p className="text-sm text-white/50 mt-1 mb-4">
                {t('composeMessageDesc') || 'Write your message and insert variables to personalize it for each recipient.'}
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                  {error}
                </div>
              )}

              {/* Variable insertion toolbar */}
              <div className="flex items-center gap-2 mb-2">
                <div className="relative group">
                  <button className="flex items-center gap-1.5 text-sm text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 rounded-full hover:bg-emerald-500/15 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {t('insertVariable')}
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-[#0a0a0a] border border-white/[0.1] rounded-lg shadow-lg py-1 hidden group-focus-within:block hover:block z-10 min-w-[160px]">
                    {columns.map((col) => (
                      <button
                        key={col}
                        onClick={() => insertVariable(col)}
                        className="block w-full text-right px-3 py-1.5 text-sm text-white/70 hover:bg-emerald-500/10 hover:text-emerald-400"
                        dir="ltr"
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Text area */}
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className={`w-full px-4 py-3 bg-white/[0.05] border rounded-lg text-sm font-mono text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 resize-none ${
                  isOverLimit ? 'border-red-500/50' : 'border-white/[0.1]'
                }`}
                placeholder="Hi {{first_name}}, this is a reminder..."
                dir="rtl"
              />

              {/* Character counter + clear */}
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-white/30'}`} dir="ltr">
                  {body.length} / {META_TEMPLATE_CHAR_LIMIT}
                </span>
                <button onClick={() => setBody('')} className="text-xs text-white/30 hover:text-white/60">
                  {t('clear') || 'Clear'}
                </button>
              </div>
            </div>

            {/* Pricing summary */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">{t('campaignCost') || 'Cost for this campaign'}</span>
                <span className="text-lg font-bold text-white">
                  {validCount.toLocaleString()} {t('credits')}
                </span>
              </div>
              <p className="text-xs text-white/40 mt-1">
                1 {t('credit') || 'credit'} × {validCount.toLocaleString()} {t('recipients')}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs text-white/40">
                  {t('yourBalance') || 'Your balance'}: {balance !== null ? balance.toLocaleString() : '...'} {t('credits')}
                </span>
                {balance !== null && (
                  hasSufficientCredits ? (
                    <span className="text-xs text-emerald-400 font-medium">{t('sufficient') || 'Sufficient'}</span>
                  ) : (
                    <>
                      <span className="text-xs text-red-400 font-medium">{t('insufficient') || 'Insufficient'}</span>
                      <Link href="/credits" className="text-xs text-emerald-400 hover:underline mr-1">
                        {t('buyCredits')}
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/campaigns/new/step-b"
                className="bg-white/[0.05] border border-white/[0.1] text-white/70 px-4 py-3 sm:py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors text-center"
              >
                {t('back')}
              </Link>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="bg-white text-[#060606] px-6 py-3 sm:py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? t('submitting') : t('next')}
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Preview — 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6 lg:sticky lg:top-24">
              <h3 className="text-sm font-semibold text-white/50 mb-3">{t('preview')}</h3>

              {/* Recipient selector */}
              {sampleRows.length > 0 && (
                <div className="mb-4">
                  <label className="text-xs text-white/40 mb-1 block">{t('previewAs') || 'Preview as'}:</label>
                  <select
                    value={previewIndex}
                    onChange={(e) => setPreviewIndex(Number(e.target.value))}
                    className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                  >
                    {sampleRows.map((row, i) => (
                      <option key={i} value={i} className="bg-[#0a0a0a] text-white">
                        {row.first_name || row.name || row.phone_number || `Row ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* WhatsApp-style preview */}
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="bg-[#1a2e1a] text-white px-4 py-2.5 flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium" dir="ltr">SendThem</p>
                    <p className="text-xs text-white/70" dir="ltr">Business Account</p>
                  </div>
                </div>

                <div className="p-4 min-h-[120px]">
                  {previewText ? (
                    <div className="bg-[#1a2e1a] text-white/90 rounded-2xl rounded-tr-none p-3 max-w-[90%]" dir="rtl">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{previewText}</p>
                      <p className="text-[10px] text-white/40 text-left mt-1" dir="ltr">10:42</p>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-white/30 py-8">
                      {t('startTypingPreview') || 'Start typing to see a preview...'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
