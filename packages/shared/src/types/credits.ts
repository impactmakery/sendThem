export const CREDIT_PACK_NAMES = ['trial', 'starter', 'growth', 'pro', 'scale'] as const;

export type CreditPackName = (typeof CREDIT_PACK_NAMES)[number];

export interface CreditPack {
  name: CreditPackName;
  credits: number;
  priceILS: number; // in agorot (smallest unit)
  pricePerMessage: number; // in agorot
  displayPrice: string; // e.g., "₪225"
  displayPerMessage: string; // e.g., "₪0.45"
  isPurchasable: boolean;
  tagline: string;
}

export const CREDIT_PACKS: Record<CreditPackName, CreditPack> = {
  trial: {
    name: 'trial',
    credits: 50,
    priceILS: 0,
    pricePerMessage: 0,
    displayPrice: 'Free',
    displayPerMessage: 'Free',
    isPurchasable: false,
    tagline: 'Try it out',
  },
  starter: {
    name: 'starter',
    credits: 500,
    priceILS: 22500, // ₪225 in agorot
    pricePerMessage: 45, // ₪0.45
    displayPrice: '₪225',
    displayPerMessage: '₪0.45',
    isPurchasable: true,
    tagline: 'For one-time campaigns',
  },
  growth: {
    name: 'growth',
    credits: 2000,
    priceILS: 78000,
    pricePerMessage: 39,
    displayPrice: '₪780',
    displayPerMessage: '₪0.39',
    isPurchasable: true,
    tagline: 'For regular senders',
  },
  pro: {
    name: 'pro',
    credits: 10000,
    priceILS: 350000,
    pricePerMessage: 35,
    displayPrice: '₪3,500',
    displayPerMessage: '₪0.35',
    isPurchasable: true,
    tagline: 'Best value for active organizations',
  },
  scale: {
    name: 'scale',
    credits: 50000,
    priceILS: 1500000,
    pricePerMessage: 30,
    displayPrice: '₪15,000',
    displayPerMessage: '₪0.30',
    isPurchasable: true,
    tagline: 'For high-volume needs',
  },
};

export const CREDIT_TRANSACTION_TYPES = [
  'signup_bonus',
  'purchase',
  'send_deduction',
  'refund',
] as const;

export type CreditTransactionType = (typeof CREDIT_TRANSACTION_TYPES)[number];

export interface CreditTransaction {
  id: string;
  userId: string;
  type: CreditTransactionType;
  amount: number;
  balanceAfter: number;
  campaignId: string | null;
  paymentId: string | null;
  description: string | null;
  createdAt: string;
}
