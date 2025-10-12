import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type SessionSummary = {
  id: string;
  started_at: string | null;
  completed_at: string | null;
  total: number;
  correct: number;
};

const formatDate = (iso: string | null) => {
  if (!iso) {
    return 'In progress';
  }

  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(iso));
  } catch {
    return iso;
  }
};

export default async function ResultsPage() {
  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data: sessions, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('id, started_at, completed_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .limit(10);

  if (sessionError) {
    throw new Error('Unable to load quiz sessions.');
  }

  if (!sessions || sessions.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-surface/70 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">My Results</h1>
        <p className="mt-3 text-sm text-subtle">
          You haven&apos;t completed any quiz sessions yet. Start a quiz to see your results here.
        </p>
        <Link
          href="/app/quiz/all"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
        >
          Start a quiz
        </Link>
      </section>
    );
  }

  const sessionIds = sessions.map((session) => session.id);

  const { data: answers, error: answerError } = await supabase
    .from('quiz_answers')
    .select('session_id, is_correct')
    .in('session_id', sessionIds);

  if (answerError) {
    throw new Error('Unable to load quiz results.');
  }

  const summaries = sessions.map<SessionSummary>((session) => {
    const relatedAnswers = answers?.filter((answer) => answer.session_id === session.id) ?? [];
    const total = relatedAnswers.length;
    const correct = relatedAnswers.filter((answer) => answer.is_correct === true).length;

    return {
      id: session.id,
      started_at: session.started_at,
      completed_at: session.completed_at,
      total,
      correct
    };
  });

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">My Results</h1>
          <Link
            href="/app/quiz/all"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Take another quiz
          </Link>
        </div>
        <p className="mt-3 text-sm text-subtle">
          Review your last 10 quiz sessions. Scores are calculated from your recorded answers.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/60 shadow-xl shadow-black/20 backdrop-blur">
        <table className="w-full table-fixed divide-y divide-white/10 text-sm text-white">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-subtle">
            <tr>
              <th className="px-6 py-4 text-left">Session</th>
              <th className="px-6 py-4 text-left">Date</th>
              <th className="px-6 py-4 text-left">Score</th>
              <th className="px-6 py-4 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {summaries.map((summary) => {
              const percentage =
                summary.total > 0 ? Math.round((summary.correct / summary.total) * 100) : 0;

              return (
                <tr key={summary.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <p className="font-medium text-white">Quiz session</p>
                    <p className="text-xs text-subtle">
                      {summary.completed_at ? 'Completed' : 'In progress'}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-subtle">
                    {formatDate(summary.completed_at ?? summary.started_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-white">
                      {summary.correct} / {summary.total || '—'}
                    </div>
                    <div className="text-xs text-subtle">{percentage}% correct</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/app/results/${summary.id}`}
                      className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-light"
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
