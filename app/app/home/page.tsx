export default function HomePage() {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/70 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
      <h2 className="text-2xl font-semibold text-white">Welcome back!</h2>
      <p className="mt-4 text-base text-subtle">
        Choose a category to start a 10-question quiz.
      </p>
      <p className="mt-2 text-sm text-subtle">
        We are preparing personalized recommendations based on your recent performance.
      </p>
    </div>
  );
}
