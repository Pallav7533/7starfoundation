"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

type Tab = "contact_enquiries" | "csr_enquiries";

export default function Enquiries() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [tab, setTab] = useState<Tab>("contact_enquiries");
  const [rows, setRows] = useState<any[]>([]);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from(tab).select("*").order("created_at", { ascending: false }).limit(200);
    setErr(error?.message ?? ""); setRows(data ?? []);
  }, [supabase, tab]);
  useEffect(() => { load(); }, [load]);

  async function toggle(r: any) { await supabase.from(tab).update({ is_read: !r.is_read }).eq("id", r.id); load(); }
  async function del(r: any) {
    if (!confirm("Delete this enquiry permanently?")) return;
    await supabase.from(tab).delete().eq("id", r.id); load();
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-navy">CSR and Contact Enquiries</h1>
      <div className="mt-5 flex gap-2">
        {([["contact_enquiries", "Contact Enquiries"], ["csr_enquiries", "CSR Enquiries"]] as [Tab, string][]).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-full px-5 py-2 text-sm font-semibold ${tab === k ? "bg-magenta text-white" : "bg-white text-navy shadow-soft"}`}>{l}</button>
        ))}
      </div>
      {err && <p className="mt-4 rounded-xl bg-magenta/10 p-3 text-sm text-magenta">{err}</p>}
      <ul className="mt-6 space-y-3">
        {rows.length === 0 && <li className="rounded-2xl border border-dashed border-gold/60 p-6 text-center text-body/70">No enquiries yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className={`card p-5 ${r.is_read ? "opacity-75" : "ring-2 ring-gold/60"}`}>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-serif text-xl font-semibold text-navy">{r.name ?? r.company}{r.contact_person ? ` · ${r.contact_person}` : ""}</p>
                <p className="text-sm text-body/70">{[r.phone, r.email].filter(Boolean).join(" · ")} · {new Date(r.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
              </div>
              {r.interest && <span className="rounded-full bg-cream px-3 py-1 text-xs font-semibold text-magenta">{r.interest}</span>}
            </div>
            {r.message && <p className="mt-3 whitespace-pre-wrap text-body/85">{r.message}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={() => toggle(r)} className="btn-outline px-4 py-2">{r.is_read ? "Mark unread" : "Mark read"}</button>
              {r.phone && <a className="btn-navy px-4 py-2" href={`https://wa.me/${String(r.phone).replace(/\D/g, "").replace(/^(\d{10})$/, "91$1")}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              <button onClick={() => del(r)} className="btn border border-magenta px-4 py-2 text-magenta">Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
