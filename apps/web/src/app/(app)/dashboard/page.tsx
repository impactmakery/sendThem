'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { nextApiClient } from '@/lib/next-api-client';
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

/* ─── Icons ─── */

function IconSend({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
    </svg>
  );
}

function IconUsers({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function IconChart({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function IconPlus({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

function IconArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
  );
}

function IconClock({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

/* ─── Empty State ─── */

function EmptyState() {
  const { t } = useLanguage();
  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500/[0.12] to-teal-600/[0.06] border border-emerald-500/20 rounded-2xl p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.06] rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 flex items-start gap-5">
          <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center flex-shrink-0">
            <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{t('welcomeTo')}</h3>
            <p className="text-emerald-400 font-medium text-sm">50 {t('freeCreditsAdded')}</p>
            <p className="text-sm text-white/40 mt-1">{t('startFirstCampaign')}</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/campaigns/new/step-a"
          className="group relative bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-500/40 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/15 rounded-xl flex items-center justify-center">
              <IconSend className="w-6 h-6 text-emerald-400" />
            </div>
            <IconArrowRight className="w-5 h-5 text-emerald-400/50 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-white mb-1">{t('createNewCampaign')}</h3>
          <p className="text-sm text-white/40">{t('uploadExcelAndSend')}</p>
        </Link>

        <Link
          href="/credits"
          className="group relative bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 hover:border-white/[0.12] transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-white/[0.06] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white/50 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <IconArrowRight className="w-5 h-5 text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="font-semibold text-white mb-1">{t('buyCredits')}</h3>
          <p className="text-sm text-white/40">{t('viewPricingPlans')}</p>
        </Link>
      </div>

      {/* Empty activity */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">{t('recentActivity')}</h2>
        <div className="bg-white/[0.02] border border-white/[0.06] border-dashed rounded-2xl p-16 text-center">
          <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white/15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
            </svg>
          </div>
          <p className="text-white/30 text-sm">{t('noCampaignsYet')}</p>
          <Link
            href="/campaigns/new/step-a"
            className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 mt-3 transition-colors"
          >
            {t('createFirstCampaign')}
            <IconArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Cards ─── */

function StatsStrip({ campaigns }: { campaigns: CampaignRow[] }) {
  const { t } = useLanguage();
  const totalCampaigns = campaigns.length;
  const totalRecipients = campaigns.reduce((acc, c) => acc + c.recipientCount, 0);
  const messagesSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const deliveryRate = totalRecipients > 0 ? ((messagesSent / totalRecipients) * 100).toFixed(1) : '—';

  const stats = [
    {
      label: t('totalCampaigns'),
      value: totalCampaigns.toString(),
      icon: <IconSend className="w-5 h-5" />,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
    },
    {
      label: t('messagesSent'),
      value: messagesSent.toLocaleString(),
      icon: <IconUsers className="w-5 h-5" />,
      color: 'text-teal-400',
      bg: 'bg-teal-500/10',
    },
    {
      label: t('deliveryRate'),
      value: totalRecipients > 0 ? `${deliveryRate}%` : '—',
      icon: <IconChart className="w-5 h-5" />,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-white/40">{stat.label}</p>
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center ${stat.color}`}>
              {stat.icon}
            </div>
          </div>
          <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ─── Campaign Cards ─── */

function CampaignCard({ campaign }: { campaign: CampaignRow }) {
  const { t } = useLanguage();

  function formatDate(dateStr: string | null) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  }

  const href =
    campaign.status === 'draft'
      ? `/campaigns/new/step-a?id=${campaign.id}`
      : `/campaigns/${campaign.id}/report`;

  return (
    <Link href={href} className="group block">
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all duration-300">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate group-hover:text-emerald-400 transition-colors">
              {campaign.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <IconClock className="w-3.5 h-3.5 text-white/30" />
              <span className="text-xs text-white/30">
                {formatDate(campaign.sendCompletedAt || campaign.scheduledAt || campaign.createdAt)}
              </span>
            </div>
          </div>
          <StatusBadge status={campaign.status} />
        </div>

        <div className="flex items-center gap-6 mt-4 pt-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <IconUsers className="w-4 h-4 text-white/25" />
            <span className="text-sm text-white/50">
              {campaign.recipientCount > 0 ? campaign.recipientCount.toLocaleString() : '0'} {t('recipients')}
            </span>
          </div>
          {campaign.sentCount > 0 && (
            <div className="flex items-center gap-2">
              <IconSend className="w-4 h-4 text-emerald-400/50" />
              <span className="text-sm text-emerald-400/70">
                {campaign.sentCount.toLocaleString()} {t('sent')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ─── Loading Skeleton ─── */

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-4 bg-white/[0.06] rounded w-24" />
              <div className="w-9 h-9 bg-white/[0.06] rounded-xl" />
            </div>
            <div className="h-9 bg-white/[0.06] rounded w-20" />
          </div>
        ))}
      </div>
      {/* Campaign cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="h-5 bg-white/[0.06] rounded w-36 mb-2" />
                <div className="h-3 bg-white/[0.06] rounded w-24" />
              </div>
              <div className="h-6 bg-white/[0.06] rounded-full w-16" />
            </div>
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <div className="h-4 bg-white/[0.06] rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ─── */

export default function DashboardPage() {
  const { t } = useLanguage();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    nextApiClient<CampaignsResponse>('/campaigns')
      .then((data) => setCampaigns(data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {campaigns.length === 0 && !isLoading ? t('welcomeTo') : t('dashboard')}
          </h1>
          {campaigns.length > 0 && (
            <p className="text-sm text-white/40 mt-1">{t('manageCampaigns')}</p>
          )}
        </div>
        {campaigns.length > 0 && (
          <Link
            href="/campaigns/new/step-a"
            className="bg-white text-[#060606] px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg shadow-white/5"
          >
            <IconPlus />
            {t('newCampaign')}
          </Link>
        )}
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : campaigns.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <StatsStrip campaigns={campaigns} />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('myCampaigns')}</h2>
            <span className="text-xs text-white/30">{campaigns.length} {t('totalCampaigns').toLowerCase()}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
