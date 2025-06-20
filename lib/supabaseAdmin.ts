// lib/supabaseAdmin.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure these environment variables are available in your Next.js backend environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseServiceRoleKey) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize a Supabase client with the service role key
// This client has admin privileges and should only be used on the server-side.
export const supabaseAdmin: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // It's good practice to disable auto-refreshing tokens for service role
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function getSupabaseAuthUserIdForTelegramUser(telegramId: number): Promise<string | null> {
  if (!telegramId) {
    console.error('[supabaseAdmin] getSupabaseAuthUserIdForTelegramUser: telegramId is required.');
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from('user_telegram_links') // Your table linking Telegram IDs to Supabase Auth User IDs
    .select('supabase_auth_user_id')
    .eq('telegram_id', telegramId)
    .single(); // Expecting at most one linked Supabase user for a given Telegram ID

  if (error && error.code !== 'PGRST116') { // PGRST116: 'single' row not found, which is fine
    console.error('[supabaseAdmin] Error fetching user link for Telegram ID:', telegramId, error);
    return null;
  }

  return data ? data.supabase_auth_user_id : null;
}
