import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-accent-light">Dashboard</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Welcome to your StudyFlow home</h1>
        <p className="mt-4 max-w-2xl text-base text-subtle">
          This is a placeholder dashboard. Hook it up to Supabase quiz data to show streaks,
          accuracy, and upcoming sessions.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-surface/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">Get started</h2>
          <p className="mt-2 text-sm text-subtle">
            Create your first quiz session and track performance in real time.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-6 py-2 text-sm font-semibold text-white transition hover:bg-accent-light"
          >
            Back to landing
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-surface/60 p-6 shadow-lg shadow-black/20">
          <h2 className="text-lg font-semibold text-white">Add questions</h2>
          <p className="mt-2 text-sm text-subtle">
            Populate the `questions` table in Supabase to start adaptive learning on StudyFlow.
          </p>
        </div>
      </div>
    </section>
  );
}
