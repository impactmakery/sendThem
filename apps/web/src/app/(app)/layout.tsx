'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowser } from '@/lib/supabase-browser';
import { AppHeader } from '@/components/layout/app-header';
import { useLanguage } from '@/lib/language-context';
import { SessionGuard } from '@/components/auth/session-guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? undefined);
    });
  }, []);

  return (
    <SessionGuard>
      <div dir={dir} className="min-h-screen bg-[#060606]">
        <AppHeader userEmail={email} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {children}
        </main>
      </div>
    </SessionGuard>
  );
}
