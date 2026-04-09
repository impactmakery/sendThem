'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/lib/language-context';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const { t, locale } = useLanguage();
  const email = searchParams.get('email') || (locale === 'he' ? 'האימייל שלכם' : 'your email');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    setResending(true);
    const supabase = createSupabaseBrowser();
    await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResending(false);
    setResent(true);
  }

  return (
    <div className="text-center space-y-6">
      {/* Email icon */}
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
        <h1 className="text-2xl font-bold text-white">{t('verifyEmailTitle')}</h1>
        <p className="text-white/50 mt-2 text-sm">
          {t('verifyEmailDesc')}
          <span className="font-medium text-white" dir="ltr">
            {email}
          </span>
          {'. '}
          {t('verifyEmailHint')}
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <a
          href={`https://mail.google.com`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#060606] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
        >
          {t('openGmail')}
        </a>
        <button
          onClick={handleResend}
          disabled={resending || resent}
          className="bg-white/[0.05] border border-white/[0.1] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resent
            ? (locale === 'he' ? 'האימייל נשלח מחדש!' : 'Email resent!')
            : resending
              ? (locale === 'he' ? 'שולח מחדש...' : 'Resending...')
              : t('resendEmail')}
        </button>
      </div>

      <p className="text-xs text-white/30">
        {t('didntGetEmail')}{' '}
        <Link href="/signup" className="text-emerald-400 hover:text-emerald-300">
          {locale === 'he' ? 'הירשמו שוב עם הכתובת הנכונה' : 'Sign up again with the correct address'}
        </Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
