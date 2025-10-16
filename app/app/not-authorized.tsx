export default function NotAuthorized() {
  return (
    <section className="rounded-2xl border border-white/10 bg-surface/70 p-10 text-center shadow-2xl shadow-black/30 backdrop-blur">
      <h1 className="text-2xl font-semibold text-white">Access denied</h1>
      <p className="mt-3 text-sm text-subtle">
        You do not have permission to view this area. Contact an administrator if you think this is a mistake.
      </p>
    </section>
  );
}
