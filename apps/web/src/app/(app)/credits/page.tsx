'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CREDIT_PACKS, type CreditPackName, type CreditTransactionType } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';
import { createSupabaseBrowser } from '@/lib/supabase-browser';

const PURCHASABLE_PACKS: CreditPackName[] = ['starter', 'growth', 'pro', 'scale'];

interface CreditTx {
  id: string;
  type: CreditTransactionType;
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

function CreditsContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CreditTx[]>([]);
  const [loadingPack, setLoadingPack] = useState<CreditPackName | null>(null);

  const showSuccess = searchParams.get('success') === 'true';
  const showCanceled = searchParams.get('canceled') === 'true';

  useEffect(() => {
    fetch('/api/credits/balance')
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => {});

    fetch('/api/credits/history')
      .then((r) => r.json())
      .then((d) => setTransactions(d.transactions ?? []))
      .catch(() => {});
  }, []);

  async function handleBuy(packName: CreditPackName) {
    setLoadingPack(packName);
    try {
      const supabase = createSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(session?.access_token
            ? { Authorization: `Bearer ${session.access_token}` }
            : {}),
        },
        body: JSON.stringify({ packId: packName }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoadingPack(null);
    }
  }

  function formatTxType(type: string): string {
    const map: Record<string, () => string> = {
      purchase: () => t('txPurchase'),
      signup_bonus: () => t('txSignupBonus'),
      send_deduction: () => t('txSendDeduction'),
      refund: () => t('txRefund'),
    };
    return map[type]?.() ?? type;
  }

  function formatDate(iso: string): string {
    const d = new Date(iso);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  return (
    <div className="space-y-8">
      {/* Success / Canceled banners */}
      {showSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-6 py-4 text-emerald-400 text-sm font-medium">
          {t('purchaseSuccess')}
        </div>
      )}
      {showCanceled && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-6 py-4 text-yellow-400 text-sm font-medium">
          {t('purchaseCanceled')}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{t('buyCredits')}</h1>
        <p className="text-white/50 mt-1 text-sm">
          {t('noSubscription')}. {t('creditsNeverExpire')}.
        </p>
      </div>

      {/* Current balance */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
        <span className="text-sm text-emerald-400">{t('creditBalance')}</span>
        <span className="text-xl font-bold text-emerald-400">
          {balance !== null ? `${balance.toLocaleString()} ${t('credits')}` : '...'}
        </span>
      </div>

      {/* Pack cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PURCHASABLE_PACKS.map((packName) => {
          const pack = CREDIT_PACKS[packName];
          const isPopular = packName === 'pro';
          const isLoading = loadingPack === packName;

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
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {pack.credits.toLocaleString()} {t('messages')}
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('creditsNeverExpire')}
                </li>
                <li className="flex items-center gap-2 text-sm text-white/50">
                  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {t('taxInvoiceIncluded')}
                </li>
              </ul>

              <button
                onClick={() => handleBuy(packName)}
                disabled={isLoading || loadingPack !== null}
                className={`mt-6 w-full py-3 sm:py-2.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isPopular
                    ? 'bg-white text-[#060606] hover:bg-white/90'
                    : 'bg-white/[0.05] border border-white/[0.1] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                {isLoading
                  ? t('processing')
                  : `${t('buy')} ${pack.name.charAt(0).toUpperCase() + pack.name.slice(1)}`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-6 text-center">
        <p className="font-semibold text-white">{t('enterpriseTitle')}</p>
        <p className="text-sm text-white/50 mt-1">{t('enterpriseDesc')}</p>
        <button className="mt-3 w-full sm:w-auto bg-white/[0.05] border border-white/[0.1] text-white/70 px-5 py-3 sm:py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors">
          {t('contactUs')}
        </button>
      </div>

      {/* Transaction history */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">{t('transactionHistory')}</h2>

        {transactions.length === 0 ? (
          <p className="text-sm text-white/50">{t('noTransactions')}</p>
        ) : (
          <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[480px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="text-start text-white/50 font-medium px-4 py-3">{t('date')}</th>
                    <th className="text-start text-white/50 font-medium px-4 py-3">{t('type')}</th>
                    <th className="text-start text-white/50 font-medium px-4 py-3">{t('amount')}</th>
                    <th className="text-start text-white/50 font-medium px-4 py-3">{t('balanceAfter')}</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/[0.04] last:border-0">
                      <td className="px-4 py-3 text-white/70">{formatDate(tx.created_at)}</td>
                      <td className="px-4 py-3 text-white/70">{formatTxType(tx.type)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            tx.amount > 0
                              ? 'text-emerald-400 font-medium'
                              : 'text-red-400 font-medium'
                          }
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {tx.balance_after.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        {[
          { q: t('faqCreditsExpire'), a: t('faqCreditsExpireAnswer') },
          { q: t('faqPaymentMethods'), a: t('faqPaymentMethodsAnswer') },
          { q: t('faqRefund'), a: t('faqRefundAnswer') },
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

export default function CreditsPage() {
  return (
    <Suspense>
      <CreditsContent />
    </Suspense>
  );
}
