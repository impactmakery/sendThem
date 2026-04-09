'use client';

import { useEffect, useMemo, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { nextApiClient } from '@/lib/next-api-client';
import { useLanguage } from '@/lib/language-context';
import { useToast } from '@/components/ui/toast';
import { CAMPAIGN_STATUSES } from '@repo/shared';
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

/* ─── Confirm Dialog ─── */

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onCancel}>
      <div
        className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-white/50 mb-6">{message}</p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="bg-white/[0.05] border border-white/[0.1] text-white/70 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Campaign Cards ─── */

interface CampaignCardProps {
  campaign: CampaignRow;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

function CampaignCard({ campaign, onDelete, onDuplicate }: CampaignCardProps) {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

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
    <div className="relative group">
      <Link href={href} className="block">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 hover:border-emerald-500/20 hover:bg-white/[0.04] transition-all duration-300">
          <div className="flex items-start justify-between gap-3 mb-3">
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

      {/* Three-dot menu — bottom-end corner */}
      <div ref={menuRef} className="absolute bottom-3 end-3 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/[0.1] text-white/30 hover:text-white/70 transition-all opacity-0 group-hover:opacity-100"
          aria-label="Campaign actions"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute bottom-full end-0 mb-1 bg-[#111] border border-white/[0.1] rounded-xl shadow-xl py-1 min-w-[160px] z-20">
            {/* Duplicate — available for all statuses */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                onDuplicate(campaign.id);
              }}
              className="w-full text-right px-4 py-2 text-sm text-white/70 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
              {t('duplicateCampaign')}
            </button>

            {/* Delete — only for draft */}
            {campaign.status === 'draft' && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(campaign.id);
                }}
                className="w-full text-right px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                {t('deleteCampaign')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
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
  const { toast } = useToast();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');

  const STATUS_LABEL_MAP: Record<CampaignStatus, string> = {
    draft: t('draft'),
    pending_template_approval: t('pendingApproval'),
    template_rejected: t('templateRejected'),
    ready_to_send: t('readyToSend'),
    scheduled: t('scheduled'),
    sending: t('sendingStatus'),
    sent: t('sentStatus'),
    partially_failed: t('partiallyFailed'),
    failed: t('failedStatus'),
    canceled: t('canceled'),
  };

  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') {
      result = result.filter((c) => c.status === statusFilter);
    }
    return result;
  }, [campaigns, searchQuery, statusFilter]);

  useEffect(() => {
    nextApiClient<CampaignsResponse>('/campaigns')
      .then((data) => setCampaigns(data.campaigns))
      .catch(() => setCampaigns([]))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setDeleteTarget(id);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await nextApiClient(`/campaigns/${deleteTarget}`, { method: 'DELETE' });
      setCampaigns((prev) => prev.filter((c) => c.id !== deleteTarget));
      toast({ title: t('campaignDeleted'), variant: 'success' });
    } catch {
      // silently fail — API returns error messages
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    try {
      // Fetch the original campaign details
      const original = await nextApiClient<{
        id: string;
        name: string;
        notes: string | null;
        templateBody: string | null;
        variableMapping: Record<string, string> | null;
      }>(`/campaigns/${id}`);

      // Create a new campaign with "(copy)" suffix
      const newCampaign = await nextApiClient<{ id: string; name: string; notes: string }>('/campaigns', {
        method: 'POST',
        body: {
          name: `${original.name} (copy)`,
          notes: original.notes || '',
        },
      });

      // If original had a template, also copy it to the new campaign
      if (original.templateBody) {
        await nextApiClient(`/campaigns/${newCampaign.id}`, {
          method: 'PATCH',
          body: {
            templateBody: original.templateBody,
            variableMapping: original.variableMapping || {},
          },
        });
      }

      toast({ title: t('campaignDuplicated'), variant: 'success' });
      // Navigate to the new campaign wizard
      router.push(`/campaigns/new/step-a?id=${newCampaign.id}`);
    } catch {
      // silently fail
    } finally {
      setDuplicatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={t('deleteCampaign')}
        message={t('deleteConfirm')}
        confirmLabel={t('delete_')}
        cancelLabel={t('cancel')}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Duplicating overlay */}
      {duplicatingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#111] border border-white/[0.1] rounded-2xl p-6 flex items-center gap-3">
            <svg className="w-5 h-5 text-emerald-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm text-white">{t('duplicating')}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            {campaigns.length === 0 && !isLoading ? t('welcomeTo') : t('dashboard')}
          </h1>
          {campaigns.length > 0 && (
            <p className="text-sm text-white/40 mt-1">{t('manageCampaigns')}</p>
          )}
        </div>
        {campaigns.length > 0 && (
          <Link
            href="/campaigns/new/step-a"
            className="bg-white text-[#060606] px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg shadow-white/5 flex-shrink-0"
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

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchCampaigns')}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl ps-10 pe-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | 'all')}
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-colors min-w-[160px]"
              aria-label={t('filterByStatus')}
            >
              <option value="all" className="bg-[#111]">{t('allStatuses')}</option>
              {CAMPAIGN_STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#111]">{STATUS_LABEL_MAP[s]}</option>
              ))}
            </select>
          </div>

          {filteredCampaigns.length === 0 ? (
            <div className="bg-white/[0.02] border border-white/[0.06] border-dashed rounded-2xl p-12 text-center">
              <p className="text-white/30 text-sm">{t('noMatchingCampaigns')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onDelete={handleDelete}
                  onDuplicate={handleDuplicate}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
