export const CAMPAIGN_STATUSES = [
  'draft',
  'pending_template_approval',
  'template_rejected',
  'ready_to_send',
  'scheduled',
  'sending',
  'sent',
  'partially_failed',
  'failed',
  'canceled',
] as const;

export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

/** Map of each state to its valid next states */
export const CAMPAIGN_TRANSITIONS: Record<CampaignStatus, readonly CampaignStatus[]> = {
  draft: ['pending_template_approval'],
  pending_template_approval: ['ready_to_send', 'template_rejected'],
  template_rejected: ['pending_template_approval'],
  ready_to_send: ['draft', 'scheduled', 'sending'],
  scheduled: ['sending', 'canceled', 'draft'],
  sending: ['sent', 'partially_failed', 'failed'],
  sent: [],
  partially_failed: [],
  failed: ['sending'], // retry
  canceled: [],
};

export interface Campaign {
  id: string;
  userId: string;
  name: string;
  notes: string | null;
  status: CampaignStatus;
  metaTemplateId: string | null;
  metaTemplateName: string | null;
  templateBody: string | null;
  variableMapping: Record<string, string> | null;
  rejectionReason: string | null;
  recipientCount: number;
  validCount: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  scheduledAt: string | null;
  sendStartedAt: string | null;
  sendCompletedAt: string | null;
  complianceDeclaredAt: string | null;
  filePath: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCampaignInput {
  name: string;
  notes?: string;
}

export interface UpdateCampaignInput {
  name?: string;
  notes?: string;
  templateBody?: string;
  variableMapping?: Record<string, string>;
  scheduledAt?: string;
}

export interface CampaignListItem {
  id: string;
  name: string;
  status: CampaignStatus;
  recipientCount: number;
  sentCount: number;
  scheduledAt: string | null;
  sendCompletedAt: string | null;
  createdAt: string;
}

export interface UploadValidationResult {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  autoCorrectCount: number;
  detectedColumns: string[];
  sampleRows: Record<string, string>[];
  invalidReasons: { reason: string; count: number }[];
}
