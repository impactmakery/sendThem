import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from './lib/supabase-middleware';

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (e) {
    // If middleware fails (e.g. Supabase unreachable), let the request through
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
