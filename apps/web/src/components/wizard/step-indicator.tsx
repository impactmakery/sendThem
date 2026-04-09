'use client';

import { useLanguage } from '@/lib/language-context';
import type { TranslationKey } from '@/lib/i18n';

const STEPS: { num: number; labelKey: TranslationKey }[] = [
  { num: 1, labelKey: 'stepDetails' },
  { num: 2, labelKey: 'stepUpload' },
  { num: 3, labelKey: 'stepCompose' },
  { num: 4, labelKey: 'stepReview' },
  { num: 5, labelKey: 'stepSend' },
];

interface StepIndicatorProps {
  currentStep: number; // 1-5
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto px-2 -mx-2 scrollbar-none">
      {STEPS.map((step, i) => {
        const isActive = step.num === currentStep;
        const isCompleted = step.num < currentStep;

        return (
          <div key={step.num} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500 text-white'
                    : isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/[0.06] text-white/30'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.num
                )}
              </div>
              <span
                className={`text-xs mt-1 whitespace-nowrap ${
                  isActive ? 'text-emerald-400 font-medium' : 'text-white/30'
                } hidden sm:block`}
              >
                {t(step.labelKey)}
              </span>
              {/* Mobile: only show label for active step */}
              <span
                className={`text-xs mt-1 whitespace-nowrap sm:hidden ${
                  isActive ? 'text-emerald-400 font-medium' : 'text-transparent'
                }`}
              >
                {isActive ? t(step.labelKey) : '\u00A0'}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-12 h-0.5 mx-1 mb-5 ${
                  step.num < currentStep ? 'bg-emerald-500/40' : 'bg-white/[0.06]'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
