'use client';

import { useLanguage } from '@/lib/language-context';

export function LanguageToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <button
      onClick={() => setLocale(locale === 'he' ? 'en' : 'he')}
      className={`text-xs font-medium px-2.5 py-1 rounded-full border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] transition-colors ${className}`}
    >
      {locale === 'he' ? 'EN' : 'עב'}
    </button>
  );
}
