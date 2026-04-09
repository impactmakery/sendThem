'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { useLanguage } from '@/lib/language-context';

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { t, dir } = useLanguage();
  const router = useRouter();
  const [expired, setExpired] = useState(false);
  const supabaseRef = useRef(createSupabaseBrowser());

  useEffect(() => {
    const supabase = supabaseRef.current;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setExpired(true);
      }
    });

    // Periodic session check
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setExpired(true);
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <>
      {children}

      {expired && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div
            dir={dir}
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
          >
            {/* Icon */}
            <div className="w-14 h-14 mx-auto mb-5 bg-red-500/10 rounded-full flex items-center justify-center">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>

            <h2 className="text-lg font-semibold text-white mb-2">
              {t('sessionExpired')}
            </h2>
            <p className="text-sm text-white/50 mb-6">
              {t('sessionExpiredDesc')}
            </p>

            <button
              onClick={handleLogin}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
            >
              {t('loginAgain')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
