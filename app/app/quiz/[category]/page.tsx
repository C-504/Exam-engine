import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import QuizRunner from './quiz-runner';

type QuizPageProps = {
  params: {
    category: string;
  };
};

const VALID_LIMIT = 10;

export const dynamic = 'force-dynamic';

export default async function QuizPage({ params }: QuizPageProps) {
  const rawCategory = params.category ? decodeURIComponent(params.category) : '';

  if (!rawCategory) {
    return notFound();
  }

  const category = rawCategory === 'all' ? null : rawCategory;

  const { user } = await requireAuth();
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({ user_id: user.id })
    .select('id')
    .single();

  if (error || !data) {
    throw new Error('Unable to create quiz session.');
  }

  return (
    <QuizRunner
      sessionId={data.id}
      category={category}
      totalQuestions={VALID_LIMIT}
    />
  );
}
