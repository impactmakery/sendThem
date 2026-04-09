import { NextResponse } from 'next/server';
import { createSupabaseServer } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('credit_balance')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Failed to fetch credit balance:', error);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    return NextResponse.json({ balance: data?.credit_balance ?? 0 });
  } catch (error: unknown) {
    console.error('Balance endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
