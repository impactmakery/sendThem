import { CAMPAIGN_TRANSITIONS, type CampaignStatus } from '../types/campaign';

export const CAMPAIGN_NAME_MAX_LENGTH = 80;
export const CAMPAIGN_NOTES_MAX_LENGTH = 500;
export const TEMPLATE_BODY_MAX_LENGTH = 1024;

export function validateCampaignName(name: string): string | null {
  if (!name || name.trim().length === 0) return 'Campaign name is required';
  if (name.length > CAMPAIGN_NAME_MAX_LENGTH)
    return `Campaign name must be ${CAMPAIGN_NAME_MAX_LENGTH} characters or less`;
  return null;
}

export function validateTemplateBody(body: string): string | null {
  if (!body || body.trim().length === 0) return 'Message template is required';
  if (body.length > TEMPLATE_BODY_MAX_LENGTH)
    return `Message must be ${TEMPLATE_BODY_MAX_LENGTH} characters or less`;
  return null;
}

export function isValidTransition(from: CampaignStatus, to: CampaignStatus): boolean {
  return CAMPAIGN_TRANSITIONS[from].includes(to);
}
