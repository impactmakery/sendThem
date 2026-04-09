import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CREDIT_PACKS, type CreditPackName } from '@repo/shared';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const packId = body.packId as CreditPackName;

    if (!packId || !CREDIT_PACKS[packId]) {
      return NextResponse.json({ error: 'Invalid pack ID' }, { status: 400 });
    }

    const pack = CREDIT_PACKS[packId];

    if (!pack.isPurchasable) {
      return NextResponse.json({ error: 'This pack is not purchasable' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await getStripe().checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'ils',
            product_data: {
              name: `${pack.name.charAt(0).toUpperCase() + pack.name.slice(1)} — ${pack.credits.toLocaleString()} credits`,
              description: pack.tagline,
            },
            unit_amount: pack.priceILS, // already in agorot (smallest unit)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/credits?success=true`,
      cancel_url: `${origin}/credits?canceled=true`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        packId,
        credits: String(pack.credits),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    console.error('Stripe checkout error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
