import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL for admin client.');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY for admin client.');
}

if (typeof window !== 'undefined') {
  throw new Error('createSupabaseAdminClient must only be called on the server.');
}

export const createSupabaseAdminClient = () =>
  createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

export type SupabaseAdminClient = ReturnType<typeof createSupabaseAdminClient>;
