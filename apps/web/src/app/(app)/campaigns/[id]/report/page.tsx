'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';
import { nextApiClient } from '@/lib/next-api-client';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { CampaignStatus } from '@repo/shared';

interface CampaignReport {
  id: string;
  name: string;
  status: CampaignStatus;
  recipientCount: number;
  validCount: number;
  templateBody: string | null;
  createdAt: string;
  scheduledAt: string | null;
  sendCompletedAt: string | null;
  messageStats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
  };
}

interface Recipient {
  id: string;
  phoneNumber: string;
  variables: Record<string, string> | null;
  status: string;
  createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-white/10 text-white/50',
  sent: 'bg-emerald-500/10 text-emerald-400',
  delivered: 'bg-green-500/10 text-green-400',
  read: 'bg-blue-500/10 text-blue-400',
  failed: 'bg-red-500/10 text-red-400',
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${formatDate(dateStr)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-white/[0.06] rounded w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
            <div className="h-9 bg-white/[0.06] rounded w-20 mb-2" />
            <div className="h-4 bg-white/[0.06] rounded w-24" />
          </div>
        ))}
      </div>
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-white/[0.06] rounded" />
        ))}
      </div>
    </div>
  );
}

export default function ReportPage() {
  const { t } = useLanguage();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignReport | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalRecipients, setTotalRecipients] = useState(0);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await nextApiClient<CampaignReport>(`/campaigns/${campaignId}`);
        setCampaign(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load campaign');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [campaignId]);

  useEffect(() => {
    async function loadRecipients() {
      try {
        const data = await nextApiClient<{ recipients: Recipient[]; total: number }>(
          `/campaigns/${campaignId}/recipients?page=${page}&limit=50&filter=${filter}`
        );
        setRecipients(data.recipients);
        setTotalRecipients(data.total);
      } catch {
        // non-critical
      }
    }
    if (campaign) loadRecipients();
  }, [campaignId, campaign, page, filter]);

  if (loading) {
    return (
      <div>
        <div className="text-sm text-white/40 mb-4">
          <Link href="/dashboard" className="hover:text-emerald-400">{t('dashboard')}</Link>
          {' / '}
          <span>{t('loading') || 'Loading...'}</span>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
        <Link href="/dashboard" className="text-emerald-400 hover:underline">{t('backToDashboard') || 'Back to dashboard'}</Link>
      </div>
    );
  }

  const stats = campaign.messageStats;
  const totalSent = stats.sent + stats.delivered + stats.read + stats.failed;
  const deliveryRate = totalSent > 0 ? (((stats.delivered + stats.read) / totalSent) * 100).toFixed(1) : '0';
  const readRate = totalSent > 0 ? ((stats.read / totalSent) * 100).toFixed(1) : '0';
  const failRate = totalSent > 0 ? ((stats.failed / totalSent) * 100).toFixed(1) : '0';

  const statusLabelMap: Record<string, string> = {
    pending: t('pending') || 'Pending',
    sent: t('sent'),
    delivered: t('delivered'),
    read: t('read'),
    failed: t('failed'),
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-white/40">
        <Link href="/dashboard" className="hover:text-emerald-400">{t('dashboard')}</Link>
        {' / '}
        <span className="text-white">{campaign.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            <StatusBadge status={campaign.status} />
            <span className="text-sm text-white/50">
              {formatDateTime(campaign.sendCompletedAt || campaign.scheduledAt || campaign.createdAt)}
            </span>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-white">{campaign.recipientCount.toLocaleString()}</p>
          <p className="text-sm text-white/40 mt-1">{t('totalRecipients') || 'Total Recipients'}</p>
        </div>
        <div className="bg-green-500/[0.06] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-green-400">{(stats.delivered + stats.read).toLocaleString()}</p>
          <p className="text-sm text-green-400/60 mt-1">{t('delivered')} ({deliveryRate}%)</p>
        </div>
        <div className="bg-blue-500/[0.06] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-blue-400">{stats.read.toLocaleString()}</p>
          <p className="text-sm text-blue-400/60 mt-1">{t('read')} ({readRate}%)</p>
        </div>
        <div className="bg-red-500/[0.06] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-red-400">{stats.failed.toLocaleString()}</p>
          <p className="text-sm text-red-400/60 mt-1">{t('failed')} ({failRate}%)</p>
        </div>
      </div>

      {/* Progress bar */}
      {totalSent > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4">
          <div className="flex h-4 rounded-full overflow-hidden bg-white/[0.06]">
            <div className="bg-blue-500" style={{ width: `${readRate}%` }} title={`${t('read')}: ${readRate}%`} />
            <div className="bg-green-500" style={{ width: `${Number(deliveryRate) - Number(readRate)}%` }} title={t('delivered')} />
            <div className="bg-red-500" style={{ width: `${failRate}%` }} title={`${t('failed')}: ${failRate}%`} />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-white/40">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" /> {t('read')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" /> {t('delivered')}</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full" /> {t('failed')}</span>
          </div>
        </div>
      )}

      {/* Template preview */}
      {campaign.templateBody && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white/50 mb-2">{t('messageTemplate')}</h3>
          <p className="text-sm text-white/70 whitespace-pre-wrap" dir="rtl">{campaign.templateBody}</p>
        </div>
      )}

      {/* Recipients table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{t('recipients')}</h3>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="bg-white/[0.05] border border-white/[0.1] text-white rounded-lg px-2 py-1 text-xs focus:outline-none"
            >
              <option value="all">{t('all') || 'All'}</option>
              <option value="valid">{t('valid') || 'Valid'}</option>
              <option value="invalid">{t('invalid') || 'Invalid'}</option>
              <option value="duplicate">{t('duplicate') || 'Duplicate'}</option>
            </select>
            <span className="text-xs text-white/30">{totalRecipients.toLocaleString()} {t('total')}</span>
          </div>
        </div>
        {recipients.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('phone')}</th>
                <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('name') || 'Name'}</th>
                <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {recipients.map((rec) => (
                <tr key={rec.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 text-sm text-white/70 font-mono" dir="ltr">{rec.phoneNumber}</td>
                  <td className="px-4 py-2 text-sm text-white">
                    {rec.variables?.first_name || rec.variables?.name || '—'}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[rec.status] || STATUS_STYLES.pending}`}>
                      {statusLabelMap[rec.status] || rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-white/30 text-sm">
            {t('noRecipients') || 'No recipients found'}
          </div>
        )}

        {/* Pagination */}
        {totalRecipients > 50 && (
          <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs text-white/50 hover:text-white disabled:opacity-30"
            >
              {t('previous') || 'Previous'}
            </button>
            <span className="text-xs text-white/30">
              {t('page') || 'Page'} {page} / {Math.ceil(totalRecipients / 50)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(totalRecipients / 50)}
              className="text-xs text-white/50 hover:text-white disabled:opacity-30"
            >
              {t('next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
