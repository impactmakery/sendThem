'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { StepIndicator } from '@/components/wizard/step-indicator';
import { useWizardStore } from '@/stores/wizard-store';
import { useLanguage } from '@/lib/language-context';

export default function StepEPage() {
  const { campaignName, validation } = useWizardStore();
  const { t } = useLanguage();
  const total = validation?.validCount || 500;

  // Simulated sending progress — will be replaced by SSE
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setSent((prev) => {
        const next = prev + Math.floor(Math.random() * 20 + 10);
        if (next >= total) {
          setIsComplete(true);
          clearInterval(interval);
          return total;
        }
        // Simulate occasional failure
        if (Math.random() < 0.02) {
          setFailed((f) => f + 1);
        }
        return next;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [total, isComplete]);

  const progress = Math.min((sent / total) * 100, 100);
  const queued = Math.max(total - sent - failed, 0);

  return (
    <div>
      <StepIndicator currentStep={5} />

      <div className="max-w-2xl mx-auto text-center">
        {/* Progress ring */}
        <div className="relative w-40 h-40 mx-auto mb-6">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
            <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#10b981"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white">
          {isComplete ? t('campaignComplete') : t('sendingProgress')}
        </h2>
        <p className="text-sm text-white/50 mt-1">
          {isComplete
            ? `${total.toLocaleString()} ${t('sent').toLowerCase()}`
            : "You can navigate away — sending will continue in the background."}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="bg-emerald-500/10 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-2xl font-bold text-emerald-400">{sent.toLocaleString()}</p>
            <p className="text-xs text-emerald-400/70 mt-0.5">{t('sent')}</p>
          </div>
          <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4">
            <p className="text-2xl font-bold text-white/50">{queued.toLocaleString()}</p>
            <p className="text-xs text-white/30 mt-0.5">{t('queued')}</p>
          </div>
          <div className="bg-red-500/10 border border-white/[0.06] rounded-2xl p-4">
            <p className="text-2xl font-bold text-red-400">{failed}</p>
            <p className="text-xs text-red-400/70 mt-0.5">{t('failed')}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-6 bg-white/[0.06] rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-white/30 mt-2" dir="ltr">
          {sent.toLocaleString()} / {total.toLocaleString()} messages
        </p>

        {/* Actions */}
        <div className="flex gap-3 justify-center mt-8">
          {isComplete ? (
            <Link
              href="/dashboard"
              className="bg-emerald-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              {t('viewReport')}
            </Link>
          ) : (
            <>
              <Link
                href="/dashboard"
                className="border border-white/[0.1] text-white/70 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-white/[0.05] transition-colors"
              >
                Continue in background
              </Link>
              <button className="border border-red-500/30 text-red-400 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-red-500/10 transition-colors">
                Stop sending
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
