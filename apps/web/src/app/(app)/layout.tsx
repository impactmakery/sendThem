'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { AppHeader } from '@/components/layout/app-header';
import { useLanguage } from '@/lib/language-context';

interface MeResponse {
  id: string;
  email: string;
  creditBalance: number;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useLanguage();
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [creditBalance, setCreditBalance] = useState<number>(0);

  useEffect(() => {
    apiClient<MeResponse>('/me')
      .then((data) => {
        setEmail(data.email);
        setCreditBalance(data.creditBalance);
      })
      .catch(() => {
        // Auth failure will be handled by route guards
      });
  }, []);

  return (
    <div dir={dir} className="min-h-screen bg-[#060606]">
      <AppHeader creditBalance={creditBalance} userEmail={email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
