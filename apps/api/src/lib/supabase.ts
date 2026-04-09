import { createClient } from '@supabase/supabase-js';
import { getEnv } from '../config/env';

let supabaseAdmin: ReturnType<typeof createClient>;

/** Supabase client with service role key — for server-side operations */
export function getSupabaseAdmin() {
  if (!supabaseAdmin) {
    const env = getEnv();
    supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  }
  return supabaseAdmin;
}
