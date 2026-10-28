// Shown instantly while the next page loads, so clicks feel immediate.
export default function Loading() {
  return (
    <div className="container-x py-24" aria-busy="true" aria-live="polite">
      <div className="mx-auto h-8 w-2/3 max-w-xl animate-pulse rounded-full bg-navy/10" />
      <div className="mx-auto mt-5 h-4 w-1/2 max-w-md animate-pulse rounded-full bg-navy/10" />
      <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
        <div className="h-48 animate-pulse rounded-2xl bg-navy/10" />
        <div className="h-48 animate-pulse rounded-2xl bg-navy/10" />
        <div className="h-48 animate-pulse rounded-2xl bg-navy/10" />
      </div>
    </div>
  );
}
