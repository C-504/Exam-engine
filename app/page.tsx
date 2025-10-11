import Link from 'next/link';

export default function LandingPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
      <div className="max-w-3xl space-y-8">
        <p className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs uppercase tracking-[0.2em] text-subtle">
          Learn faster with focused quizzes
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Master any topic with adaptive quiz sessions tailored to your progress.
        </h1>
        <p className="max-w-2xl text-lg text-subtle">
          StudyFlow turns questions into insights. Build streaks, revisit weak spots, and measure
          improvement with detailed analytics—all powered by Supabase and tuned for speed on
          Netlify.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-white shadow-lg shadow-accent/40 transition hover:bg-accent-light"
          >
            Start learning
          </Link>
          <Link
            href="/home"
            className="inline-flex items-center justify-center rounded-full border border-white/15 px-8 py-3 text-base font-semibold text-white transition hover:border-white/40 hover:bg-white/5"
          >
            Explore dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
