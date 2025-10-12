'use server';

import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import { createSupabaseServerActionClient } from '@/lib/supabaseServer';
import { validateAnswer } from '@/lib/quiz/answerValidator';

export type SubmitAnswerInput = {
  sessionId: string;
  questionId: string;
  chosenIndex: number;
  currentIndex: number;
  totalQuestions: number;
};

export type SubmitAnswerResult = {
  isCorrect: boolean;
  alreadyAnswered: boolean;
  nextIndex: number;
};

export async function submitAnswerAction({
  sessionId,
  questionId,
  chosenIndex,
  currentIndex,
  totalQuestions
}: SubmitAnswerInput): Promise<SubmitAnswerResult> {
  if (!sessionId || !questionId) {
    throw new Error('Missing session or question identifier.');
  }

  if (!Number.isInteger(chosenIndex)) {
    throw new Error('Invalid answer selection.');
  }

  if (!Number.isInteger(currentIndex) || !Number.isInteger(totalQuestions)) {
    throw new Error('Invalid quiz state.');
  }

  const { user } = await requireAuth();
  const supabase = createSupabaseServerActionClient();

  const { data: sessionRow, error: sessionError } = await supabase
    .from('quiz_sessions')
    .select('id, user_id, completed_at')
    .eq('id', sessionId)
    .single();

  if (sessionError || !sessionRow) {
    throw new Error('Quiz session not found.');
  }

  if (sessionRow.user_id !== user.id) {
    throw new Error('Unauthorized quiz session access.');
  }

  if (sessionRow.completed_at) {
    return {
      isCorrect: false,
      alreadyAnswered: true,
      nextIndex: Math.min(currentIndex + 1, totalQuestions)
    };
  }

  const { data: existingAnswer, error: existingError } = await supabase
    .from('quiz_answers')
    .select('id, is_correct')
    .eq('session_id', sessionId)
    .eq('question_id', questionId)
    .maybeSingle();

  if (existingError) {
    throw new Error('Failed to check existing answers.');
  }

  if (existingAnswer) {
    return {
      isCorrect: existingAnswer.is_correct ?? false,
      alreadyAnswered: true,
      nextIndex: Math.min(currentIndex + 1, totalQuestions)
    };
  }

  const { data: questionRow, error: questionError } = await supabase
    .from('questions')
    .select('correct_index, options, is_active')
    .eq('id', questionId)
    .single();

  if (questionError || !questionRow || questionRow.is_active !== true) {
    throw new Error('Question not available.');
  }

  const optionsLength = Array.isArray(questionRow.options) ? questionRow.options.length : 0;

  const validation = validateAnswer({
    correctIndex: questionRow.correct_index ?? -1,
    chosenIndex,
    optionsCount: optionsLength
  });

  if (!validation.isValid) {
    throw new Error('Selected option is invalid.');
  }

  const { error: insertError } = await supabase.from('quiz_answers').insert({
    session_id: sessionId,
    question_id: questionId,
    chosen_index: chosenIndex,
    is_correct: validation.isCorrect
  });

  if (insertError) {
    throw new Error('Unable to record quiz answer.');
  }

  const nextIndex = Math.min(currentIndex + 1, totalQuestions);

  if (nextIndex >= totalQuestions) {
    const { error: completeError } = await supabase
      .from('quiz_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (completeError) {
      throw new Error('Unable to complete quiz session.');
    }

    revalidatePath('/app/home');
  }

  return {
    isCorrect: validation.isCorrect,
    alreadyAnswered: false,
    nextIndex
  };
}
