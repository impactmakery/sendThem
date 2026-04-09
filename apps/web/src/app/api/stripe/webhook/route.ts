import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

function getWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET!;
}

// Service-role client bypasses RLS — needed because webhooks have no user session
function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, sig, getWebhookSecret());
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Webhook signature verification failed:', message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const packId = session.metadata?.packId;
    const credits = Number(session.metadata?.credits);

    if (!userId || !packId || !credits) {
      console.error('Missing metadata in checkout session:', session.id);
      return NextResponse.json({ received: true });
    }

    const supabase = createSupabaseAdmin();

    try {
      // 1. Insert payment record
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert({
          user_id: userId,
          stripe_session_id: session.id,
          stripe_payment_id: session.payment_intent as string,
          pack_name: packId,
          credits,
          amount_ils: session.amount_total || 0,
          status: 'completed',
        })
        .select('id')
        .single();

      if (paymentError) {
        console.error('Failed to insert payment:', paymentError);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }

      // 2. Update user credit balance atomically and get new balance
      // Use rpc or raw update — we read current, add, and write back
      const { data: currentUser, error: userFetchError } = await supabase
        .from('users')
        .select('credit_balance')
        .eq('id', userId)
        .single();

      if (userFetchError || !currentUser) {
        console.error('Failed to fetch user balance:', userFetchError);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }

      const newBalance = (currentUser.credit_balance || 0) + credits;

      const { error: updateError } = await supabase
        .from('users')
        .update({ credit_balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) {
        console.error('Failed to update credit balance:', updateError);
        return NextResponse.json({ error: 'DB error' }, { status: 500 });
      }

      // 3. Insert credit transaction
      const { error: txError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          type: 'purchase',
          amount: credits,
          balance_after: newBalance,
          payment_id: payment.id,
          description: `Purchased ${packId} pack (${credits.toLocaleString()} credits)`,
        });

      if (txError) {
        console.error('Failed to insert credit transaction:', txError);
        // Non-critical — payment and balance already updated
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
      return NextResponse.json({ error: 'Processing error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
