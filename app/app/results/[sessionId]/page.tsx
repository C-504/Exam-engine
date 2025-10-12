import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

type SessionParams = {
  params: {
    sessionId: string;
  };
};

type AnswerRow = {
  id: string;
  chosen_index: number;
  is_correct: boolean | null;
  answered_at: string | null;
  questions: {
    prompt: string;
    options: string[] | null;
    correct_index: number;
    category: string | null;
  } | null;
};

const OPTION_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];

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

export default async function ResultsDetailPage({ params }: SessionParams) {
  const { sessionId } = params;

  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data: session, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('id, started_at, completed_at, user_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session || session.user_id !== user.id) {
    return notFound();
  }

  const { data: answers, error: answersError } = await supabase
    .from('quiz_answers')
    .select(
      'id, chosen_index, is_correct, answered_at, questions!inner(prompt, options, correct_index, category)'
    )
    .eq('session_id', sessionId)
    .order('answered_at', { ascending: true });

  if (answersError) {
    throw new Error('Unable to load quiz details.');
  }

  const castAnswers = (answers ?? []) as AnswerRow[];
  const total = castAnswers.length;
  const correct = castAnswers.filter((answer) => answer.is_correct === true).length;

  if (total === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-surface/70 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">Session details</h1>
        <p className="mt-3 text-sm text-subtle">
          No answers were recorded for this session yet. Once you submit answers, you will see them here.
        </p>
        <Link
          href="/app/results"
          className="mt-6 inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Back to results
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Session details</h1>
          <p className="mt-2 text-sm text-subtle">
            Completed {formatDate(session.completed_at ?? session.started_at)} - Score {correct} / {total}
          </p>
        </div>
        <Link
          href="/app/results"
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          Back to results
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface/60 shadow-xl shadow-black/20 backdrop-blur">
        <table className="w-full table-fixed divide-y divide-white/10 text-sm text-white">
          <thead className="bg-white/5 text-xs uppercase tracking-[0.2em] text-subtle">
            <tr>
              <th className="px-6 py-4 text-left">Question</th>
              <th className="px-6 py-4 text-left">Your answer</th>
              <th className="px-6 py-4 text-left">Correct answer</th>
              <th className="px-6 py-4 text-right">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {castAnswers.map((answer, index) => {
              const question = answer.questions;
              const prompt = question?.prompt ?? 'Question unavailable';
              const options = Array.isArray(question?.options) ? question?.options ?? [] : [];
              const chosenIndex = answer.chosen_index ?? -1;
              const correctIndex = question?.correct_index ?? -1;

              const chosenLabel =
                chosenIndex >= 0
                  ? `${OPTION_LABELS[chosenIndex] ?? '?'} - ${options[chosenIndex] ?? 'Not recorded'}`
                  : 'Not answered';

              const correctLabel =
                correctIndex >= 0
                  ? `${OPTION_LABELS[correctIndex] ?? '?'} - ${options[correctIndex] ?? 'Not recorded'}`
                  : 'Not available';

              return (
                <tr key={answer.id} className="hover:bg-white/5">
                  <td className="px-6 py-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-subtle">
                      Q{index + 1} {question?.category ? `- ${question.category}` : ''}
                    </p>
                    <p className="mt-2 text-sm font-medium text-white">
                      {prompt.length > 120 ? `${prompt.slice(0, 117)}...` : prompt}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-subtle">{chosenLabel}</td>
                  <td className="px-6 py-4 text-sm text-subtle">{correctLabel}</td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        answer.is_correct ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {answer.is_correct ? 'Correct' : 'Incorrect'}
                    </span>
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
