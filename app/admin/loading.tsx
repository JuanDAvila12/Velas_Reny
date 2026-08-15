export default function Loading() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="mx-auto h-10 w-64 animate-pulse rounded-lg bg-white/60" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-28 animate-pulse rounded-2xl bg-white/60" />
          <div className="h-28 animate-pulse rounded-2xl bg-white/60" />
        </div>
        <div className="h-96 animate-pulse rounded-2xl bg-white/60" />
      </div>
    </div>
  );
}
