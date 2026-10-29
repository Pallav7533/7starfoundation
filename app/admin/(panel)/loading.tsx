// Shown instantly inside the admin panel while a page's data loads.
export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="h-9 w-64 animate-pulse rounded-full bg-navy/10" />
      <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded-full bg-navy/10" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />)}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}
