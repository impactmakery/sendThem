'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StepIndicator } from '@/components/wizard/step-indicator';
import { useWizardStore, type ValidationSummary } from '@/stores/wizard-store';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { MAX_EXCEL_FILE_SIZE, ACCEPTED_FILE_EXTENSIONS } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function StepBPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { campaignId, campaignName, fileName, validation, setFileData } = useWizardStore();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [currentFile, setCurrentFile] = useState<{ name: string; size: number } | null>(
    fileName ? { name: fileName, size: 0 } : null
  );
  const [currentValidation, setCurrentValidation] = useState<ValidationSummary | null>(validation);

  const processFile = useCallback(async (file: File) => {
    setError(null);

    if (!campaignId) {
      setError('Campaign not found. Please go back and create a campaign first.');
      return;
    }

    // Validate extension
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ACCEPTED_FILE_EXTENSIONS.includes(ext as any)) {
      setError(`This file format is not supported. Please upload an .xlsx, .xls, or .csv file.`);
      return;
    }

    // Validate size
    if (file.size > MAX_EXCEL_FILE_SIZE) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }

    setUploading(true);
    setCurrentFile({ name: file.name, size: file.size });

    try {
      const supabase = createSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/upload`, {
        method: 'POST',
        headers: {
          ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
        },
        body: formData,
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorBody.error || `HTTP ${response.status}`);
      }

      const result: ValidationSummary = await response.json();

      setCurrentValidation(result);
      setFileData(
        file.name,
        file.size,
        result,
        result.sampleRows.map((row) => ({
          phoneNumber: row.phone_number || '',
          variables: row,
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file. Please try again.');
      setCurrentFile(null);
    } finally {
      setUploading(false);
    }
  }, [campaignId, setFileData]);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  }

  function handleReplace() {
    setCurrentFile(null);
    setCurrentValidation(null);
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return (
    <div>
      <StepIndicator currentStep={2} />

      {campaignName && (
        <p className="text-sm text-white/50 mb-6">
          {t('campaignName')}: <span className="font-medium text-white/70">{campaignName}</span>
        </p>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-8">
          {!currentValidation ? (
            /* Upload state */
            <>
              <h2 className="text-xl font-bold text-white">{t('uploadRecipients')}</h2>
              <p className="text-sm text-white/50 mt-1 mb-4">
                Upload an Excel file containing phone numbers and any personalization variables.
              </p>

              <a href="#" className="inline-flex items-center gap-1.5 text-sm text-emerald-400 hover:underline mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Excel template
              </a>

              {error && (
                <div className="bg-red-500/10 text-red-400 text-sm px-4 py-3 rounded-lg border border-red-500/20 mb-4">
                  {error}
                </div>
              )}

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
                  dragOver
                    ? 'border-emerald-500/40 bg-emerald-500/[0.05]'
                    : 'border-white/[0.1] bg-white/[0.02] hover:border-emerald-500/30'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-3">
                    <svg className="w-8 h-8 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm text-white/50">{t('loading')}</p>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-emerald-500/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    <p className="text-sm font-medium text-white/70 mb-1">{t('dragDropExcel')}</p>
                    <p className="text-xs text-white/40 mb-3">{t('orBrowse')}</p>
                    <label className="inline-block bg-white text-[#060606] px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors cursor-pointer">
                      {t('orBrowse')}
                      <input type="file" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
                    </label>
                    <p className="text-xs text-white/40 mt-4">
                      Supported formats: .xlsx, .xls, .csv &middot; Max 50,000 rows &middot; Max 10 MB
                    </p>
                  </>
                )}
              </div>

              {/* Example table */}
              <div className="mt-6">
                <p className="text-sm font-medium text-white/70 mb-2">What should my Excel look like?</p>
                <div className="overflow-x-auto border border-white/[0.06] rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                        <th className="text-right px-3 py-2 text-xs font-medium text-white/40 uppercase" dir="ltr">phone_number</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-white/40 uppercase" dir="ltr">first_name</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-white/40 uppercase" dir="ltr">event_date</th>
                        <th className="text-right px-3 py-2 text-xs font-medium text-white/40 uppercase" dir="ltr">guest_count</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/50" dir="ltr">
                      <tr className="border-b border-white/[0.06]"><td className="px-3 py-1.5">+972501234567</td><td className="px-3 py-1.5">David</td><td className="px-3 py-1.5">April 14</td><td className="px-3 py-1.5">2</td></tr>
                      <tr className="border-b border-white/[0.06]"><td className="px-3 py-1.5">+972529876543</td><td className="px-3 py-1.5">Sarah</td><td className="px-3 py-1.5">April 14</td><td className="px-3 py-1.5">4</td></tr>
                      <tr><td className="px-3 py-1.5">+972541112233</td><td className="px-3 py-1.5">Michael</td><td className="px-3 py-1.5">April 14</td><td className="px-3 py-1.5">1</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-white/40 mt-1">
                  The first column must contain phone numbers. Other columns become variables you can use in your message.
                </p>
              </div>
            </>
          ) : (
            /* Validation results */
            <>
              <h2 className="text-xl font-bold text-white">{t('recipients')}</h2>
              <p className="text-sm text-white/50 mt-1 mb-6">We&apos;ve validated your file. Here&apos;s what we found.</p>

              {/* File info */}
              <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white" dir="ltr">{currentFile?.name}</p>
                  <p className="text-xs text-white/40" dir="ltr">{currentFile ? formatFileSize(currentFile.size) : ''}</p>
                </div>
                <button onClick={handleReplace} className="text-sm text-emerald-400 hover:underline">
                  Replace file
                </button>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">{currentValidation.validCount.toLocaleString()}</p>
                  <p className="text-xs text-emerald-400/70 mt-0.5">{t('validRecipients')}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-400">{currentValidation.autoCorrectCount}</p>
                  <p className="text-xs text-amber-400/70 mt-0.5">Auto-corrected</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-400">{currentValidation.invalidCount}</p>
                  <p className="text-xs text-red-400/70 mt-0.5">{t('invalidRecipients')}</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-orange-400">{currentValidation.duplicateCount}</p>
                  <p className="text-xs text-orange-400/70 mt-0.5">{t('duplicates')}</p>
                </div>
              </div>

              {/* Summary banner */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 text-sm text-amber-400 mb-6">
                We&apos;ll send to <strong>{currentValidation.validCount.toLocaleString()}</strong> {t('recipients').toLowerCase()}.{' '}
                {currentValidation.invalidCount + currentValidation.duplicateCount} invalid/duplicate rows will be excluded.
              </div>

              {/* Sample preview table */}
              <div>
                <p className="text-sm font-medium text-white/70 mb-2">Sample preview (first 5 rows)</p>
                <div className="overflow-x-auto border border-white/[0.06] rounded-lg">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white/[0.03] border-b border-white/[0.06]">
                        {currentValidation.detectedColumns.map((col) => (
                          <th key={col} className="text-right px-3 py-2 text-xs font-medium text-white/40 uppercase" dir="ltr">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-white/50" dir="ltr">
                      {currentValidation.sampleRows.map((row, i) => (
                        <tr key={i} className="border-b border-white/[0.06] last:border-0">
                          {currentValidation!.detectedColumns.map((col) => (
                            <td key={col} className="px-3 py-1.5">{row[col] || '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Detected variables */}
              <div className="mt-4">
                <p className="text-sm font-medium text-white/70 mb-2">Detected variables</p>
                <div className="flex flex-wrap gap-2">
                  {currentValidation.detectedColumns
                    .filter((c) => c !== 'phone_number')
                    .map((col) => (
                      <span key={col} className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-medium border border-emerald-500/20" dir="ltr">
                        {col}
                      </span>
                    ))}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/[0.06]">
            <Link
              href="/campaigns/new/step-a"
              className="bg-white/[0.05] border border-white/[0.1] text-white/70 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors"
            >
              {t('back')}
            </Link>
            <button
              onClick={() => router.push('/campaigns/new/step-c')}
              disabled={!currentValidation}
              className="bg-white text-[#060606] px-6 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {t('next')}
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
