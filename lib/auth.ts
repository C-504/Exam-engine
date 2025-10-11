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
    data: { session }
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return {
    session,
    user: session.user
  };
}
