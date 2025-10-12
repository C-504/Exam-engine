import { redirect } from 'next/navigation';
import type { Session, User } from '@supabase/supabase-js';
import { createSupabaseServerClient } from './supabaseServer';

type AuthContext = {
  session: Session;
  user: User;
};

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

  return {
    session,
    user
  };
}
