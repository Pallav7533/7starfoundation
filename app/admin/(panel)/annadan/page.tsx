"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { downloadCsv, toCsv } from "@/lib/csv";

type Ashram = { id: string; name: string };
type Row = {
  id: string; ashram_id: string; donation_date: string; meal_session: "morning" | "evening"; donor_name: string;
  family_org: string | null; occasion: string | null; phone_private: string | null; address_private: string | null;
  notes_private: string | null; public_display_consent: boolean; status: "draft" | "published";
};
const OCCASIONS = ["", "Birthday", "Anniversary", "In Memory", "Family Seva", "Other"];
const PAGE = 15;
/**
 * Register order: oldest date first (31/10 before 4/11), then Morning before Evening,
 * then the entry that was added first. Used by the list and both CSV exports.
 * ("morning" sorts AFTER "evening" alphabetically, so meal_session is sorted descending to put Morning first.)
 */
const orderEntries = (q: any) =>
  q.order("donation_date", { ascending: true })
    .order("meal_session", { ascending: false })
    .order("created_at", { ascending: true });
const istToday = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());

export default function AnnadanAdmin() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [ashrams, setAshrams] = useState<Ashram[]>([]);
  const empty = useCallback((): Partial<Row> => ({
    donation_date: istToday(), meal_session: "morning", donor_name: "", family_org: "", occasion: "",
    phone_private: "", address_private: "", notes_private: "", public_display_consent: true, status: "draft",
  }), []);
  const [form, setForm] = useState<Partial<Row>>(empty());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  // filters
  const [fDate, setFDate] = useState("");
  const [fSession, setFSession] = useState("");
  const [fAshram, setFAshram] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSearch, setFSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(istToday().slice(0, 7));

  useEffect(() => {
    supabase.from("ashrams").select("id,name").order("sort_order").then(({ data }) => {
      setAshrams((data as Ashram[]) ?? []);
      if (data?.length) setForm((f) => ({ ...f, ashram_id: f.ashram_id ?? data[0].id }));
    });
  }, [supabase]);

  const applyFilters = useCallback((q: any) => {
    if (fDate) q = q.eq("donation_date", fDate);
    if (fSession) q = q.eq("meal_session", fSession);
    if (fAshram) q = q.eq("ashram_id", fAshram);
    if (fStatus) q = q.eq("status", fStatus);
    if (fSearch.trim()) q = q.ilike("donor_name", `%${fSearch.trim().replace(/[%,]/g, "")}%`);
    return q;
  }, [fDate, fSession, fAshram, fStatus, fSearch]);

  const load = useCallback(async () => {
    setLoading(true);
    const q = orderEntries(applyFilters(supabase.from("meal_donations").select("*", { count: "exact" })))
      .range(page * PAGE, page * PAGE + PAGE - 1);
    const { data, count, error } = await q;
    if (error) setMsg({ t: "err", m: "Could not load entries: " + error.message });
    setRows((data as Row[]) ?? []); setTotal(count ?? 0); setLoading(false);
  }, [supabase, applyFilters, page]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(0); }, [fDate, fSession, fAshram, fStatus, fSearch]);

  const set = (k: keyof Row, v: any) => setForm((f) => ({ ...f, [k]: v }));
  const ashramName = (id: string) => ashrams.find((a) => a.id === id)?.name ?? "";

  async function save(status: "draft" | "published") {
    setMsg(null);
    if (!form.donor_name?.trim()) { setMsg({ t: "err", m: "Donor name is required." }); return; }
    if (!form.ashram_id) { setMsg({ t: "err", m: "Please choose an ashram." }); return; }
    if (status === "published" && !form.public_display_consent) { setMsg({ t: "err", m: "Tick Public Display Permission before publishing." }); return; }
    setSaving(true);
    const payload = {
      ashram_id: form.ashram_id, donation_date: form.donation_date, meal_session: form.meal_session,
      donor_name: form.donor_name.trim(), family_org: form.family_org?.trim() || null, occasion: form.occasion || null,
      phone_private: form.phone_private?.trim() || null, address_private: form.address_private?.trim() || null,
      notes_private: form.notes_private?.trim() || null, public_display_consent: !!form.public_display_consent, status,
    };
    const res = form.id
      ? await supabase.from("meal_donations").update(payload).eq("id", form.id)
      : await supabase.from("meal_donations").insert(payload);
    setSaving(false);
    if (res.error) { setMsg({ t: "err", m: res.error.message }); return; }
    setMsg({ t: "ok", m: status === "published" ? "Saved and published. It is now live on the website." : "Saved as draft." });
    // keep date / ashram / session so several donors can be added quickly
    setForm({ ...empty(), donation_date: form.donation_date, ashram_id: form.ashram_id, meal_session: form.meal_session });
    load();
  }

  async function togglePublish(r: Row) {
    if (r.status === "draft" && !r.public_display_consent) { setMsg({ t: "err", m: "Edit this entry and record public display permission first." }); return; }
    const { error } = await supabase.from("meal_donations").update({ status: r.status === "published" ? "draft" : "published" }).eq("id", r.id);
    if (error) setMsg({ t: "err", m: error.message }); else load();
  }
  async function del(r: Row) {
    if (!confirm(`Delete the entry for "${r.donor_name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("meal_donations").delete().eq("id", r.id);
    if (error) setMsg({ t: "err", m: error.message }); else load();
  }

  async function exportAll() {
    const { data } = await orderEntries(applyFilters(supabase.from("meal_donations").select("*"))).limit(5000);
    const list = (data as Row[]) ?? [];
    downloadCsv(`annadan-register-${istToday()}.csv`, toCsv(
      ["Date", "Session", "Ashram", "Donor", "Family/Organization", "Occasion", "Phone (private)", "Address (private)", "Notes (private)", "Public permission", "Status"],
      list.map((r) => [r.donation_date, r.meal_session, ashramName(r.ashram_id), r.donor_name, r.family_org, r.occasion, r.phone_private, r.address_private, r.notes_private, r.public_display_consent ? "yes" : "no", r.status])));
  }
  async function exportMonth() {
    const [y, m] = month.split("-").map(Number);
    const start = `${month}-01`;
    const end = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 10);
    const { data } = await orderEntries(supabase.from("meal_donations").select("*").gte("donation_date", start).lt("donation_date", end)).limit(10000);
    const list = (data as Row[]) ?? [];
    downloadCsv(`annadan-monthly-report-${month}.csv`, toCsv(
      ["Date", "Session", "Ashram", "Donor", "Family/Organization", "Occasion", "Status"],
      list.map((r) => [r.donation_date, r.meal_session, ashramName(r.ashram_id), r.donor_name, r.family_org, r.occasion, r.status])));
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-navy">Annadan Seva Register</h1>
      <p className="mt-1 text-body/70">Add as many donors as needed for the same date and meal session.</p>

      {msg && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${msg.t === "ok" ? "bg-green-100 text-green-800" : "bg-magenta/10 text-magenta"}`}>{msg.m}</p>}

      <section className="card mt-6 p-5 sm:p-8">
        <h2 className="text-2xl font-semibold text-navy">{form.id ? "Edit Donor Entry" : "Add Donor Entry"}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label className="label">Donation Date</label><input type="date" value={form.donation_date ?? ""} onChange={(e) => set("donation_date", e.target.value)} className="field" /></div>
          <div><label className="label">Ashram</label>
            <select value={form.ashram_id ?? ""} onChange={(e) => set("ashram_id", e.target.value)} className="field">{ashrams.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
          <div><label className="label">Meal Session</label>
            <select value={form.meal_session} onChange={(e) => set("meal_session", e.target.value)} className="field"><option value="morning">Morning</option><option value="evening">Evening</option></select></div>
          <div><label className="label">Donor Full Name *</label><input value={form.donor_name ?? ""} onChange={(e) => set("donor_name", e.target.value)} className="field" /></div>
          <div><label className="label">Family or Organization Name</label><input value={form.family_org ?? ""} onChange={(e) => set("family_org", e.target.value)} className="field" /></div>
          <div><label className="label">Occasion</label>
            <select value={form.occasion ?? ""} onChange={(e) => set("occasion", e.target.value)} className="field">{OCCASIONS.map((o) => <option key={o} value={o}>{o || "None"}</option>)}</select></div>
          <div><label className="label">Phone Number (private)</label><input type="tel" value={form.phone_private ?? ""} onChange={(e) => set("phone_private", e.target.value)} className="field" /></div>
          <div className="lg:col-span-2"><label className="label">Address (private)</label><input value={form.address_private ?? ""} onChange={(e) => set("address_private", e.target.value)} className="field" /></div>
          <div className="sm:col-span-2 lg:col-span-3"><label className="label">Private Notes</label><textarea rows={2} value={form.notes_private ?? ""} onChange={(e) => set("notes_private", e.target.value)} className="field" /></div>
        </div>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" checked={!!form.public_display_consent} onChange={(e) => set("public_display_consent", e.target.checked)} className="mt-1 h-4 w-4 accent-magenta" />
          <span><strong>Public Display Permission.</strong> The donor agreed that their name and occasion may be shown on the website. Phone, address and notes are never shown.</span>
        </label>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" disabled={saving} onClick={() => save("published")} className="btn-primary disabled:opacity-60">{form.id ? "Update and Publish" : "Publish"}</button>
          <button type="button" disabled={saving} onClick={() => save("draft")} className="btn-outline disabled:opacity-60">Save Draft</button>
          {form.id && <button type="button" onClick={() => { setForm(empty()); setMsg(null); }} className="btn-outline">Cancel Edit</button>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold text-navy">All Entries</h2>
        <div className="card mt-4 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input type="date" aria-label="Filter by date" value={fDate} onChange={(e) => setFDate(e.target.value)} className="field" />
          <select aria-label="Session" value={fSession} onChange={(e) => setFSession(e.target.value)} className="field"><option value="">All sessions</option><option value="morning">Morning</option><option value="evening">Evening</option></select>
          <select aria-label="Ashram" value={fAshram} onChange={(e) => setFAshram(e.target.value)} className="field"><option value="">All ashrams</option>{ashrams.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
          <select aria-label="Status" value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="field"><option value="">All statuses</option><option value="draft">Draft</option><option value="published">Published</option></select>
          <input type="search" aria-label="Search donor" placeholder="Search donor name" value={fSearch} onChange={(e) => setFSearch(e.target.value)} className="field" />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { setFDate(""); setFSession(""); setFAshram(""); setFStatus(""); setFSearch(""); }} className="text-sm font-semibold text-magenta hover:underline">Clear filters</button>
          <button type="button" onClick={exportAll} className="btn-navy px-4 py-2">Export CSV (private details included)</button>
          <span className="ml-auto flex items-center gap-2">
            <input type="month" aria-label="Report month" value={month} onChange={(e) => setMonth(e.target.value)} className="field !w-auto" />
            <button type="button" onClick={exportMonth} className="btn-outline px-4 py-2">Monthly Report</button>
          </span>
        </div>

        {/* mobile cards */}
        <ul className="mt-4 space-y-3 md:hidden">
          {rows.map((r) => (
            <li key={r.id} className="card p-4">
              <p className="font-serif text-xl font-semibold text-navy">{r.donor_name}</p>
              <p className="text-sm text-body/70">{r.donation_date} · {r.meal_session} · {ashramName(r.ashram_id)}</p>
              <p className="text-sm">{r.occasion || "No occasion"} · <span className={r.status === "published" ? "font-semibold text-green-700" : "font-semibold text-gold-dark"}>{r.status}</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => { setForm(r); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-outline px-4 py-2">Edit</button>
                <button onClick={() => togglePublish(r)} className="btn-navy px-4 py-2">{r.status === "published" ? "Unpublish" : "Publish"}</button>
                <button onClick={() => del(r)} className="btn border border-magenta px-4 py-2 text-magenta">Delete</button>
              </div>
            </li>
          ))}
        </ul>
        {/* desktop table */}
        <div className="card mt-4 hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy text-white"><tr>{["Date", "Session", "Ashram", "Donor", "Occasion", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-navy/10">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3 whitespace-nowrap">{r.donation_date}</td>
                  <td className="px-4 py-3 capitalize">{r.meal_session}</td>
                  <td className="px-4 py-3">{ashramName(r.ashram_id)}</td>
                  <td className="px-4 py-3"><span className="font-medium text-navy">{r.donor_name}</span>{r.family_org && <span className="block text-xs text-body/60">{r.family_org}</span>}</td>
                  <td className="px-4 py-3">{r.occasion || "—"}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "published" ? "bg-green-100 text-green-800" : "bg-gold/25 text-gold-dark"}`}>{r.status}</span></td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button onClick={() => { setForm(r); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="mr-3 font-semibold text-navy hover:underline">Edit</button>
                    <button onClick={() => togglePublish(r)} className="mr-3 font-semibold text-magenta hover:underline">{r.status === "published" ? "Unpublish" : "Publish"}</button>
                    <button onClick={() => del(r)} className="font-semibold text-red-700 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && <p className="mt-4 rounded-2xl border border-dashed border-gold/60 p-6 text-center text-body/70">No entries match these filters.</p>}
        {loading && <p className="mt-4 text-sm text-body/60">Loading…</p>}
        <div className="mt-4 flex items-center justify-between text-sm">
          <span>{total} entr{total === 1 ? "y" : "ies"}</span>
          <span className="flex items-center gap-2">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="btn-outline px-4 py-2 disabled:opacity-40">Previous</button>
            <span>Page {page + 1} of {Math.max(1, Math.ceil(total / PAGE))}</span>
            <button disabled={(page + 1) * PAGE >= total} onClick={() => setPage((p) => p + 1)} className="btn-outline px-4 py-2 disabled:opacity-40">Next</button>
          </span>
        </div>
      </section>
    </div>
  );
}
