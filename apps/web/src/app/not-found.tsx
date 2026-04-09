'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#060606] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            S
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SendThem</span>
        </div>

        {/* 404 */}
        <h1 className="text-[120px] font-extrabold leading-none bg-gradient-to-b from-white/20 to-white/5 bg-clip-text text-transparent select-none">
          404
        </h1>

        <p className="text-xl font-semibold text-white mt-4">{t('pageNotFound')}</p>
        <p className="text-sm text-white/40 mt-2">{t('pageNotFoundDesc')}</p>

        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 mt-8 bg-white text-[#060606] px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          {t('backToDashboard')}
        </Link>
      </div>
    </div>
  );
}
