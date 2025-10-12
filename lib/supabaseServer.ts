import {
  createRouteHandlerClient,
  createServerActionClient,
  createServerComponentClient
} from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

const supabaseConfig = {
  supabaseUrl,
  supabaseKey: supabaseAnonKey
};

export const createSupabaseServerClient = () =>
  createServerComponentClient({ cookies }, supabaseConfig);

export const createSupabaseServerActionClient = () =>
  createServerActionClient({ cookies }, supabaseConfig);

export const createSupabaseRouteClient = () =>
  createRouteHandlerClient({ cookies }, supabaseConfig);

export type SupabaseServerClient = ReturnType<typeof createSupabaseServerClient>;
export type SupabaseServerActionClient = ReturnType<typeof createSupabaseServerActionClient>;
export type SupabaseRouteClient = ReturnType<typeof createSupabaseRouteClient>;
