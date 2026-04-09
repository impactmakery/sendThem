'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { trackStep } from '@/lib/tracking';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';

function formatDateDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function WhatsAppIcon({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function CheckoutForm() {
  const { t, locale, dir } = useLanguage();
  const searchParams = useSearchParams();
  const prefillEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [contact, setContact] = useState(prefillEmail);
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 14);
  const formattedDate = formatDateDDMMYYYY(launchDate);

  useEffect(() => {
    trackStep('checkout_view');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError(t('fillAllFields'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact: contact.trim(),
          contactType,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      trackStep('notify_submit', { contactType });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={dir} className="bg-[#060606] text-white min-h-screen font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#060606]/80 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-sm">S</div>
            <span className="font-heading font-bold text-lg tracking-tight">SendThem</span>
          </Link>
          <LanguageToggle />
        </div>
      </nav>

      {/* Content */}
      <div className="pt-32 pb-20 px-5 flex items-center justify-center min-h-screen">
        <div className="max-w-lg mx-auto w-full">
          {/* Glow */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-emerald-500/[0.06] rounded-full blur-[100px] pointer-events-none" />

          {submitted ? (
            /* ─── Success state ─── */
            <div className="relative z-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="font-heading font-bold text-2xl md:text-3xl mb-3">
                {t('youreOnTheList')}
              </h1>
              <p className="text-white/50 text-base leading-relaxed mb-6">
                {t('willNotify')} <span className="text-white font-medium">{formattedDate}</span> {t('whenLive')}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                {t('backToHome')}
              </Link>
            </div>
          ) : (
            /* ─── Form ─── */
            <div className="relative z-10">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-emerald-400 font-medium">{t('launching')} {formattedDate}</span>
                </div>

                <h1 className="font-heading font-bold text-2xl md:text-3xl tracking-tight mb-3">
                  {t('almostThere')}
                </h1>
                <p className="text-white/50 text-base leading-relaxed">
                  {t('twoWeeksMessage')}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Full name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-1.5">
                    {t('fullName')}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all"
                  />
                </div>

                {/* Contact type toggle */}
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-1.5">
                    {t('howToReach')}
                  </label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setContactType('email')}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        contactType === 'email'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                      }`}
                    >
                      {t('email')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactType('phone')}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        contactType === 'phone'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/60'
                      }`}
                    >
                      {t('phone')}
                    </button>
                  </div>
                  <input
                    id="contact"
                    type={contactType === 'email' ? 'email' : 'tel'}
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={contactType === 'email' ? 'you@example.com' : '+972 50 123 4567'}
                    dir="ltr"
                    className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-xl text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-[#060606] font-medium py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {loading ? t('submitting') : t('notifyMe')}
                </button>

                <p className="text-center text-xs text-white/25 mt-3">
                  {t('noSpam')}
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutForm />
    </Suspense>
  );
}
