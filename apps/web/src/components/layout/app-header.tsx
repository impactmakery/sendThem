'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';

interface AppHeaderProps {
  creditBalance?: number;
  userEmail?: string;
}

export function AppHeader({ creditBalance = 0, userEmail }: AppHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-white/[0.06] bg-[#060606]/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-heading font-bold text-xs">S</div>
          <span className="font-heading font-bold text-lg tracking-tight text-white">SendThem</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Credit balance pill */}
          <Link
            href="/credits"
            className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-emerald-500/15 transition-colors border border-emerald-500/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {creditBalance.toLocaleString()} {t('credits')}
          </Link>

          {/* Buy Credits */}
          <Link
            href="/credits"
            className="border border-white/[0.1] text-white/70 px-3 py-1.5 rounded-full text-sm font-medium hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            {t('buyCredits')}
          </Link>

          <LanguageToggle />

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 bg-white/[0.08] rounded-full flex items-center justify-center text-sm font-medium text-white/60 hover:bg-white/[0.12] transition-colors"
            >
              {userEmail?.charAt(0).toUpperCase() || '?'}
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setMenuOpen(false)} />
                <div className="absolute left-0 mt-2 w-48 bg-[#111] border border-white/[0.08] rounded-xl shadow-2xl py-1 z-40">
                  <div className="px-3 py-2 text-xs text-white/40 border-b border-white/[0.06] truncate" dir="ltr">
                    {userEmail}
                  </div>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 text-sm text-white/70 hover:bg-white/[0.05] hover:text-white"
                    onClick={() => setMenuOpen(false)}
                  >
                    {t('accountSettings')}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-right px-3 py-2 text-sm text-red-400 hover:bg-white/[0.05]"
                  >
                    {t('logout')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
