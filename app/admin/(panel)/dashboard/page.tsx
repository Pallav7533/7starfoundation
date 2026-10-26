import Link from "next/link";
import { createServerSupabase } from "@/lib/supabase/server";
import { todayIST } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const db = createServerSupabase();
  const today = todayIST();
  const [m, e, p, recent, arch, unread1, unread2] = await Promise.all([
    db.from("meal_donations").select("id", { count: "exact", head: true }).eq("donation_date", today).eq("meal_session", "morning").eq("status", "published"),
    db.from("meal_donations").select("id", { count: "exact", head: true }).eq("donation_date", today).eq("meal_session", "evening").eq("status", "published"),
    db.from("meal_donations").select("id", { count: "exact", head: true }).eq("donation_date", today).eq("status", "published"),
    db.from("meal_donations").select("id,donor_name,donation_date,meal_session,status,created_at").order("created_at", { ascending: false }).limit(6),
    db.from("archive_logs").select("*").eq("status", "success").order("created_at", { ascending: false }).limit(1),
    db.from("contact_enquiries").select("id", { count: "exact", head: true }).eq("is_read", false),
    db.from("csr_enquiries").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  const last = arch.data?.[0];
  const cards = [
    ["Today's Morning Meal Donors", m.count ?? 0], ["Today's Evening Meal Donors", e.count ?? 0], ["Today's Total Published Donors", p.count ?? 0],
    ["Unread Enquiries", (unread1.count ?? 0) + (unread2.count ?? 0)],
  ];
  return (
    <div>
      <h1 className="text-4xl font-semibold text-navy">Dashboard</h1>
      <p className="mt-1 text-body/70">Welcome. Here is today&apos;s Annadan Seva at a glance.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([l, v]) => (
          <div key={l as string} className="card p-5"><p className="text-xs font-semibold uppercase tracking-wider text-navy/60">{l}</p><p className="mt-2 font-serif text-5xl text-magenta">{v}</p></div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold text-navy">Recent Entries</h2><Link href="/admin/annadan" className="btn-primary px-4 py-2">+ Add Donor</Link></div>
          {recent.data?.length ? (
            <ul className="mt-4 divide-y divide-navy/10">
              {recent.data.map((r: any) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                  <span className="font-medium text-navy">{r.donor_name}</span>
                  <span className="text-sm text-body/70">{r.donation_date} · {r.meal_session} · <span className={r.status === "published" ? "text-green-700" : "text-gold-dark"}>{r.status}</span></span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-4 text-body/70">No entries yet. Add the first donor entry to begin.</p>}
        </section>
        <section className="card p-6">
          <h2 className="text-2xl font-semibold text-navy">Last Successful Archive</h2>
          {last ? <p className="mt-3 text-sm text-body/80">{last.period} · {last.records_archived} records<br />{new Date(last.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            : <p className="mt-3 text-sm text-body/70">No archive has run yet. Archiving needs Google Drive to be configured.</p>}
          <Link href="/admin/archive" className="btn-outline mt-4 px-4 py-2">Open Archives</Link>
        </section>
      </div>
    </div>
  );
}
