import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

/**
 * POST /api/email/welcome
 *
 * Internal-only route called server-side after user signup.
 * Sends a bilingual welcome email via Resend.
 *
 * Body: { to: string; name: string }
 */
export async function POST(req: NextRequest) {
  let body: { to?: string; name?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { to, name } = body;

  if (!to?.trim() || !name?.trim()) {
    return NextResponse.json(
      { error: 'Both "to" and "name" fields are required.' },
      { status: 400 },
    );
  }

  await sendWelcomeEmail(to.trim(), name.trim());

  return NextResponse.json({ ok: true });
}
