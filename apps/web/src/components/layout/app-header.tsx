'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { nextApiClient } from '@/lib/next-api-client';
import { useLanguage } from '@/lib/language-context';
import { LanguageToggle } from '@/components/ui/language-toggle';

interface AppHeaderProps {
  creditBalance?: number;
  userEmail?: string;
}

export function AppHeader({ creditBalance: initialBalance = 0, userEmail }: AppHeaderProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [creditBalance, setCreditBalance] = useState(initialBalance);

  const fetchBalance = useCallback(async () => {
    try {
      const data = await nextApiClient<{ balance: number }>('/credits/balance');
      setCreditBalance(data.balance);
    } catch {
      // Silently fail — keep last known balance
    }
  }, []);

  // Fetch real balance on mount
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Re-fetch when window regains focus (e.g. returning from credits page)
  useEffect(() => {
    function handleFocus() {
      fetchBalance();
    }
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchBalance]);

  // Update from prop if parent re-fetches
  useEffect(() => {
    if (initialBalance > 0) {
      setCreditBalance(initialBalance);
    }
  }, [initialBalance]);

  // Close mobile menu on route change / resize
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

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

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-3">
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

        {/* Mobile: credit pill + hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <Link
            href="/credits"
            className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1.5 rounded-full text-xs font-medium border border-emerald-500/20"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12a8 8 0 11-16 0 8 8 0 0116 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {creditBalance.toLocaleString()}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-white/60 hover:bg-white/[0.08] transition-colors"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile slide-down menu */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 top-16 bg-black/60 z-20 md:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 inset-x-0 bg-[#0a0a0a] border-b border-white/[0.08] z-30 md:hidden">
            <div className="px-4 py-4 space-y-3">
              {/* User info */}
              <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
                <div className="w-10 h-10 bg-white/[0.08] rounded-full flex items-center justify-center text-sm font-medium text-white/60">
                  {userEmail?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate" dir="ltr">{userEmail}</p>
                  <p className="text-xs text-emerald-400">{creditBalance.toLocaleString()} {t('credits')}</p>
                </div>
              </div>

              {/* Nav links */}
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                {t('dashboard')}
              </Link>

              <Link
                href="/credits"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
                {t('buyCredits')}
              </Link>

              <Link
                href="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:bg-white/[0.05] hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t('accountSettings')}
              </Link>

              {/* Language toggle */}
              <div className="flex items-center justify-between px-3 py-3">
                <span className="text-sm text-white/50">Language</span>
                <LanguageToggle />
              </div>

              {/* Logout */}
              <button
                onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                {t('logout')}
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
