'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { apiClient } from '@/lib/api-client';
import { useLanguage } from '@/lib/language-context';
import type { CampaignStatus } from '@repo/shared';

interface CampaignRow {
  id: string;
  name: string;
  status: CampaignStatus;
  recipientCount: number;
  sentCount: number;
  scheduledAt: string | null;
  sendCompletedAt: string | null;
  createdAt: string;
}

interface CampaignsResponse {
  campaigns: CampaignRow[];
  total: number;
  page: number;
  limit: number;
}

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      {/* Welcome + credits callout */}
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-emerald-400">50 free credits added to your account</p>
          <p className="text-sm text-emerald-400/70 mt-0.5">
            Enough to send your first campaign to 50 recipients.
          </p>
        </div>
      </div>

      {/* Action cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/campaigns/new/step-a"
          className="bg-white text-[#060606] rounded-2xl p-6 hover:bg-white/90 transition-colors group"
        >
          <svg className="w-8 h-8 mb-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <h3 className="font-semibold text-lg">{t('createNewCampaign')}</h3>
          <p className="text-sm text-[#060606]/60 mt-1">{t('startFirstCampaign')}</p>
        </Link>

        <button className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-emerald-500/20 transition-colors text-right group">
          <svg className="w-8 h-8 mb-3 text-white/30 group-hover:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
          </svg>
          <h3 className="font-semibold text-lg text-white">{t('howItWorksTitle')}</h3>
          <p className="text-sm text-white/50 mt-1">{t('howItWorksDesc')}</p>
        </button>
      </div>

      {/* Empty activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">{t('recentActivity')}</h2>
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-12 text-center">
          <svg className="w-12 h-12 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
          </svg>
          <p className="text-white/30 text-sm">
            {t('noCampaignsYet')}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsStrip({ campaigns }: { campaigns: CampaignRow[] }) {
  const { t } = useLanguage();
  const totalCampaigns = campaigns.length;
  const messagesSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalRecipients = campaigns.reduce(
    (acc, c) => acc + (c.status === 'sent' || c.status === 'partially_failed' ? c.recipientCount : 0),
    0
  );
  const deliveryRate = totalRecipients > 0 ? ((messagesSent / totalRecipients) * 100).toFixed(1) : '—';

  const stats = [
    { label: t('totalCampaigns'), value: totalCampaigns.toString() },
    { label: t('messagesSent'), value: messagesSent.toLocaleString() },
    { label: t('deliveryRate'), value: totalRecipients > 0 ? `${deliveryRate}%` : '—' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 hover:border-emerald-500/20 transition-colors">
          <p className="text-sm text-white/40">{stat.label}</p>
          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

function CampaignTable({ campaigns }: { campaigns: CampaignRow[] }) {
  const { t } = useLanguage();
  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Name</th>
            <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Status</th>
            <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Recipients</th>
            <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Date</th>
            <th className="text-right text-xs font-medium text-white/40 px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors">
              <td className="px-4 py-3">
                <Link
                  href={
                    campaign.status === 'sent' || campaign.status === 'partially_failed'
                      ? `/campaigns/${campaign.id}/report`
                      : campaign.status === 'draft'
                        ? `/campaigns/new/step-a?id=${campaign.id}`
                        : `/campaigns/${campaign.id}/report`
                  }
                  className="text-sm font-medium text-white hover:text-emerald-400"
                >
                  {campaign.name}
                </Link>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={campaign.status} />
              </td>
              <td className="px-4 py-3 text-sm text-white/50">
                {campaign.recipientCount > 0 ? campaign.recipientCount.toLocaleString() : '—'}
              </td>
              <td className="px-4 py-3 text-sm text-white/50">
                {formatDate(campaign.sendCompletedAt || campaign.scheduledAt || campaign.createdAt)}
              </td>
              <td className="px-4 py-3">
                <button className="text-white/30 hover:text-white/60">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
            <div className="h-4 bg-white/[0.06] rounded w-24 mb-2" />
            <div className="h-8 bg-white/[0.06] rounded w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="h-4 bg-white/[0.06] rounded w-40" />
            <div className="h-4 bg-white/[0.06] rounded w-20" />
            <div className="h-4 bg-white/[0.06] rounded w-16" />
            <div className="h-4 bg-white/[0.06] rounded w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    apiClient<CampaignsResponse>('/campaigns')
      .then((data) => {
        setCampaigns(data.campaigns);
      })
      .catch(() => {
        setCampaigns([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">{t('dashboard')}</h1>
        <LoadingSkeleton />
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">{t('welcomeTo')}</h1>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsStrip campaigns={campaigns} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{t('myCampaigns')}</h2>
        <Link
          href="/campaigns/new/step-a"
          className="bg-white text-[#060606] px-4 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('newCampaign')}
        </Link>
      </div>

      <CampaignTable campaigns={campaigns} />
    </div>
  );
}
