import type { PublicDonor } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export default function DonorPanel({
  session, date, donors, loading = false, error = false, dark = false,
}: { session: "morning" | "evening"; date: string; donors: PublicDonor[]; loading?: boolean; error?: boolean; dark?: boolean }) {
  const title = session === "morning" ? "Morning Meal Seva" : "Evening Meal Seva";
  return (
    <section aria-label={title}
      className={`relative overflow-hidden rounded-3xl p-6 shadow-soft sm:p-8 ${dark ? "bg-navy text-white" : "border border-gold/40 bg-white text-body"}`}>
      <div aria-hidden className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${session === "morning" ? "bg-gold/25" : "bg-magenta/15"} blur-2xl`} />
      <div className="relative">
        <p className={`eyebrow ${dark ? "!text-gold-light" : ""}`}>{session === "morning" ? "Sunrise Seva" : "Sunset Seva"}</p>
        <h3 className={`mt-1 font-serif text-3xl font-semibold ${dark ? "text-white" : "text-navy"}`}>{title}</h3>
        <p className={`mt-1 text-sm ${dark ? "text-white/70" : "text-body/70"}`}>{formatDate(date)}</p>
        <p className={`mt-4 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${dark ? "bg-white/10 text-gold-light" : "bg-cream text-magenta"}`}>
          {loading ? "Loading…" : `${donors.length} published donor${donors.length === 1 ? "" : "s"}`}
        </p>
        <div className="mt-5">
          {error ? (
            <p className="rounded-xl bg-magenta/10 p-4 text-sm text-magenta">We couldn&apos;t load the donor list right now. Please try again shortly.</p>
          ) : loading ? (
            <ul className="space-y-3" aria-busy="true">{[0, 1, 2].map((k) => <li key={k} className={`h-14 animate-pulse rounded-xl ${dark ? "bg-white/10" : "bg-cream"}`} />)}</ul>
          ) : donors.length === 0 ? (
            <p className={`rounded-xl border border-dashed p-5 text-sm ${dark ? "border-white/25 text-white/70" : "border-gold/60 text-body/70"}`}>
              No meal donor entries have been published for this date yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {donors.map((d) => (
                <li key={d.id} className={`flex items-start justify-between gap-3 rounded-xl px-4 py-3 ${dark ? "bg-white/10" : "bg-ivory"}`}>
                  <div>
                    <p className={`font-serif text-xl font-semibold leading-tight ${dark ? "text-white" : "text-navy"}`}>{d.donor_name}</p>
                    {d.family_org && <p className={`text-sm ${dark ? "text-white/70" : "text-body/70"}`}>{d.family_org}</p>}
                  </div>
                  {d.occasion && (
                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${dark ? "bg-gold text-navy" : "bg-magenta/10 text-magenta"}`}>{d.occasion}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
