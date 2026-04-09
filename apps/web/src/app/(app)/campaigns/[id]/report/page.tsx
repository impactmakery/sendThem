'use client';

import Link from 'next/link';
import { useLanguage } from '@/lib/language-context';

// Mock report data — will be replaced by API
const MOCK_REPORT = {
  name: 'Event reminder — April 14',
  sentAt: '2026-04-14T10:00:00Z',
  totalSent: 1267,
  delivered: 1251,
  read: 892,
  failed: 16,
  recipients: [
    { phone: '+972501234567', name: 'David', status: 'read' as const, sentAt: '10:00:01', deliveredAt: '10:00:03', readAt: '10:15:22' },
    { phone: '+972529876543', name: 'Sarah', status: 'delivered' as const, sentAt: '10:00:01', deliveredAt: '10:00:04', readAt: null },
    { phone: '+972541112233', name: 'Michael', status: 'failed' as const, sentAt: '10:00:02', deliveredAt: null, readAt: null },
    { phone: '+972508765432', name: 'Rachel', status: 'read' as const, sentAt: '10:00:02', deliveredAt: '10:00:05', readAt: '10:22:11' },
    { phone: '+972525554444', name: 'Yael', status: 'delivered' as const, sentAt: '10:00:03', deliveredAt: '10:00:06', readAt: null },
  ],
};

const STATUS_STYLES = {
  sent: 'bg-green-500/10 text-green-400',
  delivered: 'bg-green-500/10 text-green-400',
  read: 'bg-blue-500/10 text-blue-400',
  failed: 'bg-red-500/10 text-red-400',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export default function ReportPage() {
  const { t } = useLanguage();
  const r = MOCK_REPORT;
  const deliveryRate = ((r.delivered / r.totalSent) * 100).toFixed(1);
  const readRate = ((r.read / r.totalSent) * 100).toFixed(1);
  const failRate = ((r.failed / r.totalSent) * 100).toFixed(1);

  const statusLabelMap: Record<string, string> = {
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
        <span>{t('myCampaigns')}</span>
        {' / '}
        <span className="text-white">{r.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{r.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
              {t('sent')}
            </span>
            <span className="text-sm text-white/50">
              {t('sentAt')} {formatDate(r.sentAt)} at 10:00 AM
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/[0.05] border border-white/[0.1] text-white/70 px-4 py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {t('exportExcel')}
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-emerald-400">{r.totalSent.toLocaleString()}</p>
          <p className="text-sm text-emerald-400/60 mt-1">{t('total')}</p>
        </div>
        <div className="bg-green-500/10 border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-green-400">{r.delivered.toLocaleString()}</p>
          <p className="text-sm text-green-400/60 mt-1">{t('delivered')} ({deliveryRate}%)</p>
        </div>
        <div className="bg-blue-500/10 border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-blue-400">{r.read.toLocaleString()}</p>
          <p className="text-sm text-blue-400/60 mt-1">{t('read')} ({readRate}%)</p>
        </div>
        <div className="bg-red-500/10 border border-white/[0.06] rounded-2xl p-5">
          <p className="text-3xl font-bold text-red-400">{r.failed}</p>
          <p className="text-sm text-red-400/60 mt-1">{t('failed')} ({failRate}%)</p>
        </div>
      </div>

      {/* Stacked bar */}
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

      {/* Recipient table */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{t('recipients')}</h3>
          <span className="text-xs text-white/30">Showing 1–{r.recipients.length} of {r.totalSent.toLocaleString()}</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('phone')}</th>
              <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('recipient')}</th>
              <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('status')}</th>
              <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('sentAt')}</th>
              <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('delivered')}</th>
              <th className="text-right text-xs font-medium text-white/40 px-4 py-2">{t('read')}</th>
            </tr>
          </thead>
          <tbody>
            {r.recipients.map((rec) => (
              <tr key={rec.phone} className="border-b border-white/[0.06]">
                <td className="px-4 py-2 text-sm text-white/70 font-mono" dir="ltr">{rec.phone}</td>
                <td className="px-4 py-2 text-sm text-white">{rec.name}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[rec.status]}`}>
                    {statusLabelMap[rec.status] || rec.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm text-white/50" dir="ltr">{rec.sentAt}</td>
                <td className="px-4 py-2 text-sm text-white/50" dir="ltr">{rec.deliveredAt || '—'}</td>
                <td className="px-4 py-2 text-sm text-white/50" dir="ltr">{rec.readAt || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
