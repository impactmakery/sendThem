'use client';

import { useState, useEffect } from 'react';
import { CREDIT_PACKS, type CreditPackName } from '@repo/shared';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';

const PURCHASABLE_PACKS: CreditPackName[] = ['starter', 'growth', 'pro', 'scale'];

export default function CreditsPage() {
  const { t } = useLanguage();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    apiClient<{ creditBalance: number }>('/me').then((data) => setBalance(data.creditBalance)).catch(() => {});
  }, []);

  function handleBuy(packName: CreditPackName) {
    // TODO: Create Stripe checkout session via API
    alert(`Buying ${packName} pack — Stripe checkout coming soon`);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('buyCredits')}</h1>
        <p className="text-white/50 mt-1 text-sm">
          {t('noSubscription')}. {t('creditsNeverExpire')}.
        </p>
      </div>

      {/* Current balance */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
        <span className="text-sm text-emerald-400">{t('creditBalance')}</span>
        <span className="text-xl font-bold text-emerald-400">{balance !== null ? `${balance.toLocaleString()} ${t('credits')}` : '...'}</span>
      </div>

      {/* Pack cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PURCHASABLE_PACKS.map((packName) => {
          const pack = CREDIT_PACKS[packName];
          const isPopular = packName === 'pro';

          return (
            <div
              key={packName}
              className={`relative bg-white/[0.03] rounded-2xl p-6 flex flex-col ${
                isPopular
                  ? 'border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.08)]'
                  : 'border border-white/[0.06]'
              }`}
            >
              {isPopular && (
                <span className="absolute -top-3 right-4 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {t('mostPopular').toUpperCase()}
                </span>
              )}

              <h3 className="text-lg font-bold text-white capitalize">{pack.name}</h3>
              <p className="text-sm text-white/50 mt-0.5">{pack.tagline}</p>

              <div className="mt-4">
                <span className="text-3xl font-bold text-white">{pack.displayPrice}</span>
              </div>
              <p className="text-sm text-white/50 mt-1">
                {pack.credits.toLocaleString()} {t('credits')}
              </p>
              <p className="text-xs text-white/50 mt-0.5">
                {pack.displayPerMessage} {t('perMessage')}
              </p>

              <ul className="mt-4 space-y-2 flex-1">
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {pack.credits.toLocaleString()} messages
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('creditsNeverExpire')}
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tax invoice included
                </li>
              </ul>

              <button
                onClick={() => handleBuy(packName)}
                className={`mt-6 w-full py-2.5 rounded-full text-sm font-medium transition-colors ${
                  isPopular
                    ? 'bg-white text-[#060606] hover:bg-white/90'
                    : 'bg-white/[0.05] border border-white/[0.1] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                {t('buy')} {pack.name.charAt(0).toUpperCase() + pack.name.slice(1)}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 text-center">
        <p className="font-semibold text-white">Need more than 50,000 messages per month?</p>
        <p className="text-sm text-white/50 mt-1">
          We offer custom enterprise pricing with monthly invoicing.
        </p>
        <button className="mt-3 bg-white/[0.05] border border-white/[0.1] text-white/70 px-5 py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors">
          Contact us
        </button>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        {[
          { q: 'Do credits expire?', a: 'No. Credits never expire. Use them whenever you need.' },
          { q: 'What payment methods do you accept?', a: 'We accept all major credit cards via Stripe.' },
          { q: 'Can I get a refund?', a: 'Unused credits can be refunded within 30 days of purchase. Contact support.' },
        ].map(({ q, a }) => (
          <details key={q} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl">
            <summary className="px-4 py-3 text-sm font-medium text-white cursor-pointer hover:bg-white/[0.03]">
              {q}
            </summary>
            <p className="px-4 pb-3 text-sm text-white/50">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
