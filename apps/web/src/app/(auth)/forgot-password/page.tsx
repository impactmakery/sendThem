'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/lib/language-context';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">{t('checkYourEmail')}</h1>
          <p className="text-white/50 mt-2 text-sm">
            {t('resetLinkSent')}<span className="font-medium text-white" dir="ltr">{email}</span>
          </p>
        </div>
        <Link
          href="/login"
          className="inline-block text-sm text-emerald-400 hover:text-emerald-300"
        >
          &larr; {t('backToLogin')}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">{t('forgotPasswordTitle')}</h1>
        <p className="text-white/50 mt-1 text-sm">
          {t('forgotPasswordDesc')}
        </p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white/50 mb-1">
          {t('email')}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40"
          placeholder="you@example.com"
          required
          dir="ltr"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-white text-[#060606] py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? t('sending') : t('sendResetLink')}
      </button>

      <Link
        href="/login"
        className="block text-center text-sm text-emerald-400 hover:text-emerald-300"
      >
        &larr; {t('backToLogin')}
      </Link>
    </form>
  );
}
