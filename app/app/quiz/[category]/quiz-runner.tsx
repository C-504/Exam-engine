"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { submitAnswerAction } from "./actions";

type Question = {
  id: string;
  category: string;
  prompt: string;
  options: string[];
};

type AnswerRecord = {
  questionId: string;
  chosenIndex: number;
  isCorrect: boolean;
};

type ToastState = {
  message: string;
  tone: "success" | "error";
};

type QuizRunnerProps = {
  sessionId: string;
  category: string | null;
  totalQuestions: number;
};

const OPTION_LABELS = ["A", "B", "C", "D", "E", "F"];

export default function QuizRunner({ sessionId, category, totalQuestions }: QuizRunnerProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadQuestions() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ limit: String(totalQuestions) });
        if (category) {
          params.set("category", category);
        }

        const response = await fetch(`/api/questions?${params.toString()}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error("Failed to fetch quiz questions.");
        }

        const data = (await response.json()) as { items: Question[] };
        setQuestions(data.items);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          return;
        }
        setError((err as Error).message ?? "Unable to fetch questions.");
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();

    return () => {
      controller.abort();
    };
  }, [category, totalQuestions, retryKey]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => clearTimeout(timer);
  }, [toast]);

  const totalLoaded = questions.length;
  const currentQuestion = useMemo(() => questions[currentIndex], [questions, currentIndex]);

  useEffect(() => {
    if (!loading && !currentQuestion && totalLoaded > 0) {
      setShowResults(true);
    }
  }, [loading, currentQuestion, totalLoaded]);

  const handleRetry = () => {
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedIndex(null);
    setShowResults(false);
    setError(null);
    setRetryKey((previous) => previous + 1);
  };

  const alreadyAnsweredIds = useMemo(
    () => new Set(answers.map((answer) => answer.questionId)),
    [answers]
  );

  const handleSubmit = async () => {
    if (!currentQuestion || selectedIndex === null) {
      setToast({
        message: "Please choose an option first.",
        tone: "error"
      });
      return;
    }

    if (alreadyAnsweredIds.has(currentQuestion.id)) {
      setToast({
        message: "You have already answered this question.",
        tone: "error"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await submitAnswerAction({
        sessionId,
        questionId: currentQuestion.id,
        chosenIndex: selectedIndex,
        currentIndex,
        totalQuestions: totalLoaded || totalQuestions
      });

      setAnswers((prev) => {
        const next = prev.filter((item) => item.questionId !== currentQuestion.id);
        next.push({
          questionId: currentQuestion.id,
          chosenIndex: selectedIndex,
          isCorrect: result.isCorrect
        });
        return next;
      });

      setToast({
        message: result.isCorrect ? "Correct answer!" : "Incorrect. Keep going!",
        tone: result.isCorrect ? "success" : "error"
      });

      const nextIndex = result.nextIndex;
      const total = totalLoaded || totalQuestions;

      if (nextIndex >= total) {
        setShowResults(true);
      } else {
        setCurrentIndex(nextIndex);
      }

      setSelectedIndex(null);
    } catch (err) {
      setToast({
        message: (err as Error).message ?? "Unable to submit answer.",
        tone: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <p className="text-subtle">Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
        <h2 className="text-xl font-semibold text-white">We hit a snag</h2>
        <p className="mt-3 text-sm text-subtle">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-accent px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent"
        >
          Retry
        </button>
      </div>
    );
  }

  if (showResults || !currentQuestion) {
    const total = totalLoaded || totalQuestions;
    const correctCount = answers.filter((answer) => answer.isCorrect).length;

    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-white/10 bg-surface/70 p-10 shadow-2xl shadow-black/30 backdrop-blur">
          <h2 className="text-2xl font-semibold text-white">Quiz complete</h2>
          <p className="mt-2 text-base text-subtle">
            You answered {correctCount} out of {total} questions correctly.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-surface/50 p-6 shadow-xl shadow-black/20 backdrop-blur">
          <h3 className="text-lg font-semibold text-white">Review</h3>
          <ul className="mt-4 space-y-4 text-sm">
            {questions.map((question, index) => {
              const answer = answers.find((item) => item.questionId === question.id);
              const isCorrect = answer?.isCorrect ?? false;
              const optionIndex = answer?.chosenIndex ?? -1;
              const label = optionIndex >= 0 ? OPTION_LABELS[optionIndex] ?? '?' : '—';

              return (
                <li
                  key={question.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 text-left"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.2em] text-subtle">
                      Q{index + 1} • {question.category}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        isCorrect ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium text-white">{question.prompt}</p>
                  <p className="mt-2 text-xs text-subtle">Your answer: {label}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex gap-3">
          <Link
            href="/app/home"
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            Back to dashboard
          </Link>
          <Link
            href="/app/quiz/all"
            className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Try another quiz
          </Link>
        </div>
      </div>
    );
  }

  const answeredCurrent = alreadyAnsweredIds.has(currentQuestion.id);
  const options = currentQuestion.options?.slice(0, OPTION_LABELS.length) ?? [];

  return (
    <div className="relative space-y-6">
      {toast ? <Toast toast={toast} onDismiss={() => setToast(null)} /> : null}
      <div className="flex items-center justify-between text-sm text-subtle">
        <span>
          Question {currentIndex + 1} / {totalLoaded || totalQuestions}
        </span>
        <span>{currentQuestion.category}</span>
      </div>
      <div className="rounded-2xl border border-white/10 bg-surface/70 p-10 shadow-2xl shadow-black/30 backdrop-blur">
        <h2 className="text-lg font-semibold text-white">{currentQuestion.prompt}</h2>
        <div className="mt-6 space-y-3">
          {options.map((option, index) => {
            const label = OPTION_LABELS[index] ?? String.fromCharCode(65 + index);
            const isSelected = selectedIndex === index;
            const disabled = isSubmitting || answeredCurrent;

            return (
              <button
                key={`${currentQuestion.id}-${index}`}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedIndex(index)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'border-accent bg-accent/20 text-white'
                    : 'border-white/10 bg-white/5 text-white hover:border-accent/40 hover:bg-accent/10'
                } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm font-semibold text-white">
                    {label}
                  </span>
                  <span className="text-sm">{option}</span>
                </span>
              </button>
            );
          })}
        </div>
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || answeredCurrent || selectedIndex === null}
            className="inline-flex items-center justify-center rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Submitting...' : 'Submit answer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  return (
    <div className="pointer-events-none fixed right-5 top-20 z-50 min-w-[220px] rounded-xl border border-white/10 bg-surface/95 p-4 text-sm shadow-2xl shadow-black/30">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white">
            {toast.tone === "success" ? "Success" : "Heads up"}
          </p>
          <p className="mt-1 text-xs text-subtle">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="pointer-events-auto text-xs text-subtle transition hover:text-white"
        >
          Close
        </button>
      </div>
    </div>
  );
}
