import { redirect } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from './supabaseServer';

export type ProfileRole = 'user' | 'admin' | 'superuser';

export type Profile = {
  id: string;
  full_name: string | null;
  role: ProfileRole;
};

export type AuthContext = {
  session: Session;
  user: User;
  profile: Profile;
};

async function loadOrCreateProfile(user: User): Promise<Profile> {
  const supabase = createSupabaseServerClient();

  const { data: existingProfile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (existingProfile) {
    return existingProfile as Profile;
  }

  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: user.id,
      full_name: (user.user_metadata?.full_name as string | undefined) ?? null
    })
    .select('id, full_name, role')
    .single();

  if (insertError) {
    throw insertError;
  }

  return newProfile as Profile;
}

export async function requireAuth(): Promise<AuthContext> {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    redirect('/login');
  }

  const profile = await loadOrCreateProfile(user);

  return {
    session,
    user,
    profile
  };
}

export async function assertSuperuser() {
  const auth = await requireAuth();

  if (auth.profile.role !== 'superuser' && auth.profile.role !== 'admin') {
    redirect('/app/not-authorized');
  }

  return auth;
}
