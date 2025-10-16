import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import NotAuthorized from '../not-authorized';

export default async function AdminPage() {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || !profile || profile.role !== 'admin') {
    return <NotAuthorized />;
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-surface/70 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
      <h1 className="text-2xl font-semibold text-white">Admin area (coming soon)</h1>
      <p className="mt-3 text-sm text-subtle">
        Use this space to manage content, review submissions, and configure quizzes once the admin panel is ready.
      </p>
    </section>
  );
}
