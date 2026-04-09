'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StepIndicator } from '@/components/wizard/step-indicator';
import { useWizardStore } from '@/stores/wizard-store';
import { useLanguage } from '@/lib/language-context';

const COMPLIANCE_TEXT = `אני מצהיר שהאחריות המלאה לקבלת הסכמה מפורשת מראש מכל הנמענים, בהתאם לסעיף 30א לחוק התקשורת (בזק ושידורים), התשמ"ב-1982, מוטלת עלי בלבד. אני מבין כי ImpactMakery והפלטפורמה אינם נושאים באחריות כלשהי לתוכן ההודעות שאני שולח או למצב ההסכמה של הנמענים שלי.`;

export default function StepDPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { campaignName, validation, templateBody } = useWizardStore();
  const [complianceAccepted, setComplianceAccepted] = useState(false);
  const [sendMode, setSendMode] = useState<'now' | 'later'>('now');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [showConfirm, setShowConfirm] = useState(false);

  const validCount = validation?.validCount || 0;

  function handleSend() {
    if (sendMode === 'now') {
      setShowConfirm(true);
    } else {
      // TODO: Schedule via API
      router.push('/dashboard');
    }
  }

  function confirmSend() {
    // TODO: Trigger send via API
    router.push('/campaigns/new/step-e');
  }

  return (
    <div>
      <StepIndicator currentStep={4} />

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Review summary — 3 cols */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">{t('review')}</h2>

              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">{t('campaignName')}</span>
                  <span className="text-sm font-medium text-white">{campaignName}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">{t('recipients')}</span>
                  <span className="text-sm font-medium text-white">{validCount.toLocaleString()} {t('validRecipients').toLowerCase()}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">{t('total')}</span>
                  <span className="text-sm font-medium text-white">{validCount.toLocaleString()} {t('credits')}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/[0.06]">
                  <span className="text-sm text-white/40">{t('messageTemplate')}</span>
                  <span className="text-sm font-medium text-emerald-400">Approved by Meta</span>
                </div>
              </div>

              {/* Approved message preview */}
              <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                <p className="text-xs font-medium text-emerald-400 mb-2">{t('messageTemplate')}</p>
                <p className="text-sm text-white/70 whitespace-pre-wrap" dir="rtl">
                  {templateBody || 'No message template set'}
                </p>
              </div>
            </div>

            {/* Compliance declaration */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-2 mb-3">
                <svg className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm font-semibold text-amber-400">{t('complianceDeclaration')}</p>
              </div>
              <div className="flex items-start gap-3">
                <input
                  id="compliance"
                  type="checkbox"
                  checked={complianceAccepted}
                  onChange={(e) => setComplianceAccepted(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/[0.1] bg-white/[0.05] accent-emerald-500"
                />
                <label htmlFor="compliance" className="text-sm text-white/50 leading-relaxed" dir="rtl">
                  {COMPLIANCE_TEXT}
                </label>
              </div>
            </div>
          </div>

          {/* Send options — 2 cols */}
          <div className="lg:col-span-2">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 sticky top-24">
              <h3 className="text-sm font-semibold text-white/50 mb-4">{t('schedule')}</h3>

              <div className="space-y-3">
                {/* Send now */}
                <button
                  onClick={() => setSendMode('now')}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-colors ${
                    sendMode === 'now'
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/[0.1] hover:border-white/[0.2]'
                  }`}
                >
                  <p className="font-medium text-white">{t('sendNow')}</p>
                  <p className="text-sm text-white/40 mt-0.5">
                    Start sending immediately after confirmation
                  </p>
                </button>

                {/* Schedule */}
                <button
                  onClick={() => setSendMode('later')}
                  className={`w-full text-right p-4 rounded-lg border-2 transition-colors ${
                    sendMode === 'later'
                      ? 'border-emerald-500/50 bg-emerald-500/10'
                      : 'border-white/[0.1] hover:border-white/[0.2]'
                  }`}
                >
                  <p className="font-medium text-white">{t('schedule')}</p>
                  <p className="text-sm text-white/40 mt-0.5">
                    Pick a specific date and time
                  </p>
                </button>

                {sendMode === 'later' && (
                  <div className="space-y-3 pt-2">
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                    />
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="w-full bg-white/[0.05] border border-white/[0.1] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
                    />
                    <p className="text-xs text-white/30">Israel Standard Time (GMT+3)</p>
                  </div>
                )}
              </div>

              {/* Send button */}
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleSend}
                  disabled={!complianceAccepted}
                  className="w-full bg-white text-[#060606] py-3 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMode === 'now'
                    ? `${t('sendCampaign')} (${validCount.toLocaleString()})`
                    : t('schedule')}
                </button>

                <Link
                  href="/campaigns/new/step-c"
                  className="block text-center bg-white/[0.05] border border-white/[0.1] text-white/70 py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors"
                >
                  {t('back')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0a0a0a] border border-white/[0.1] rounded-2xl p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-white">{t('sendCampaign')}</h3>
            <p className="text-sm text-white/50 mt-2">
              {t('sendNow')} — <strong className="text-white">{validCount.toLocaleString()}</strong> {t('recipients').toLowerCase()}?
              This will deduct <strong className="text-white">{validCount.toLocaleString()}</strong> {t('credits')}.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-white/[0.05] border border-white/[0.1] text-white/70 py-2 rounded-full text-sm font-medium hover:bg-white/[0.08]"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmSend}
                className="flex-1 bg-white text-[#060606] py-2 rounded-full text-sm font-medium hover:bg-white/90"
              >
                {t('sendNow')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
