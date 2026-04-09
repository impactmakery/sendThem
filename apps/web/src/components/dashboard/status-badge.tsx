'use client';

import type { CampaignStatus } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';
import type { TranslationKey } from '@/lib/i18n';

const STATUS_CONFIG: Record<CampaignStatus, { labelKey: TranslationKey; className: string }> = {
  draft: { labelKey: 'draft', className: 'bg-white/[0.06] text-white/50' },
  pending_template_approval: { labelKey: 'pendingApproval', className: 'bg-amber-500/10 text-amber-400' },
  template_rejected: { labelKey: 'templateRejected', className: 'bg-red-500/10 text-red-400' },
  ready_to_send: { labelKey: 'readyToSend', className: 'bg-blue-500/10 text-blue-400' },
  scheduled: { labelKey: 'scheduled', className: 'bg-blue-500/10 text-blue-400' },
  sending: { labelKey: 'sendingStatus', className: 'bg-amber-500/10 text-amber-400' },
  sent: { labelKey: 'sentStatus', className: 'bg-emerald-500/10 text-emerald-400' },
  partially_failed: { labelKey: 'partiallyFailed', className: 'bg-orange-500/10 text-orange-400' },
  failed: { labelKey: 'failedStatus', className: 'bg-red-500/10 text-red-400' },
  canceled: { labelKey: 'canceled', className: 'bg-white/[0.06] text-white/40' },
};

export function StatusBadge({ status }: { status: CampaignStatus }) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {status === 'pending_template_approval' && (
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {status === 'sending' && (
        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
      )}
      {t(config.labelKey)}
    </span>
  );
}
