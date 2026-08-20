export default function Loading() {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-8 h-10 w-56 animate-pulse rounded-lg bg-white/60" />
        <div className="mb-8 flex flex-wrap justify-center gap-4">
          <div className="h-12 w-40 animate-pulse rounded-lg bg-white/60" />
          <div className="h-12 w-40 animate-pulse rounded-lg bg-white/60" />
          <div className="h-12 w-32 animate-pulse rounded-lg bg-white/60" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </div>
    </div>
  );
}
