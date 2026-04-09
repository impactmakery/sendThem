'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';


export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, dir } = useLanguage();

  return (
    <div dir={dir} className="relative min-h-screen flex flex-row-reverse bg-[#060606]">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageToggle />
      </div>

      {/* Right side (RTL: appears on left): auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-[440px]">{children}</div>
      </div>
      {/* Left side (RTL: appears on right): illustration area */}
      <div className="hidden lg:flex flex-1 bg-white/[0.03] border-l border-white/[0.06] items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4">
          <Link href="/" className="inline-block">
            <div className="mx-auto w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-xl">S</div>
            </div>
          </Link>
          <h2 className="text-2xl font-heading font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            SendThem
          </h2>
          <p className="text-white/40 text-sm leading-relaxed">
            {locale === 'he'
              ? 'שלחו הודעות WhatsApp לקהל שלכם בבטחה ובאמינות. בלי סיכון למספר האישי.'
              : 'Send WhatsApp broadcasts to your audience safely and reliably. No risk to your personal number.'}
          </p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">
              {locale === 'he' ? 'העלאת אקסל' : 'Upload Excel'}
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">
              {locale === 'he' ? 'התאמה אישית' : 'Personalize'}
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full border border-emerald-500/20">
              {locale === 'he' ? 'שליחה' : 'Send'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
