'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { StepIndicator } from '@/components/wizard/step-indicator';
import { useWizardStore } from '@/stores/wizard-store';
import { nextApiClient } from '@/lib/next-api-client';
import { CAMPAIGN_NAME_MAX_LENGTH, CAMPAIGN_NOTES_MAX_LENGTH, validateCampaignName } from '@repo/shared';
import { useLanguage } from '@/lib/language-context';

function StepAContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { campaignId, campaignName, campaignNotes, setCampaignDetails } = useWizardStore();
  const [name, setName] = useState(campaignName);
  const [notes, setNotes] = useState(campaignNotes);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);

  // Resume draft: if ?id= is present and wizard store doesn't already have this campaign loaded
  useEffect(() => {
    const resumeId = searchParams.get('id');
    if (!resumeId) return;
    if (campaignId === resumeId) {
      // Already loaded in store — just sync local state
      setName(campaignName);
      setNotes(campaignNotes);
      return;
    }

    setIsLoadingDraft(true);
    nextApiClient<{
      id: string;
      name: string;
      notes: string | null;
      templateBody: string | null;
      variableMapping: Record<string, string> | null;
    }>(`/campaigns/${resumeId}`)
      .then((campaign) => {
        setCampaignDetails(campaign.id, campaign.name, campaign.notes || '');
        setName(campaign.name);
        setNotes(campaign.notes || '');
        // If campaign has a template body, store it too
        if (campaign.templateBody) {
          useWizardStore.getState().setTemplate(
            campaign.templateBody,
            campaign.variableMapping || {}
          );
        }
      })
      .catch(() => {
        setError('Failed to load campaign draft.');
      })
      .finally(() => setIsLoadingDraft(false));
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleNext() {
    const nameError = validateCampaignName(name);
    if (nameError) {
      setError(nameError);
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      // If resuming an existing draft, update it instead of creating a new one
      const existingId = campaignId || searchParams.get('id');
      if (existingId) {
        await nextApiClient(`/campaigns/${existingId}`, {
          method: 'PATCH',
          body: { name, notes },
        });
        setCampaignDetails(existingId, name, notes);
      } else {
        const campaign = await nextApiClient<{ id: string; name: string; notes: string }>(
          '/campaigns',
          { method: 'POST', body: { name, notes } }
        );
        setCampaignDetails(campaign.id, name, notes);
      }
      router.push('/campaigns/new/step-b');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign. Please try again.');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div>
      <StepIndicator currentStep={1} />

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/60 mb-6"
      >
        <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        {t('back')}
      </Link>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 sm:p-8">
          <h2 className="text-xl font-bold text-white">{t('campaignName')}</h2>
          <p className="text-sm text-white/50 mt-1 mb-6">
            This is for your own reference. Recipients will not see this name.
          </p>

          <div className="space-y-5">
            {/* Campaign name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/50 mb-1">
                {t('campaignName')} <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                maxLength={CAMPAIGN_NAME_MAX_LENGTH}
                className={`w-full px-3 py-2 bg-white/[0.05] border rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 ${
                  error ? 'border-red-500/40' : 'border-white/[0.1]'
                }`}
                placeholder={t('campaignNamePlaceholder')}
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-white/50 mb-1">
                {t('campaignNotes')}
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={CAMPAIGN_NOTES_MAX_LENGTH}
                rows={3}
                className="w-full px-3 py-2 bg-white/[0.05] border border-white/[0.1] rounded-lg text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 resize-none"
                placeholder={t('campaignNotesPlaceholder')}
              />
              <p className="text-xs text-white/40 mt-1 text-left" dir="ltr">
                {notes.length} / {CAMPAIGN_NOTES_MAX_LENGTH}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 pt-6 border-t border-white/[0.06]">
            <Link
              href="/dashboard"
              className="bg-white/[0.05] border border-white/[0.1] text-white/70 px-4 py-3 sm:py-2 rounded-full text-sm font-medium hover:bg-white/[0.08] transition-colors text-center"
            >
              {t('save')}
            </Link>
            <button
              onClick={handleNext}
              disabled={!name.trim() || isCreating}
              className="bg-white text-[#060606] px-6 py-3 sm:py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreating ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('loading')}
                </>
              ) : (
                <>
                  {t('next')}
                  <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StepAPage() {
  return (
    <Suspense>
      <StepAContent />
    </Suspense>
  );
}
