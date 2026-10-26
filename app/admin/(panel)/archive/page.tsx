"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function ArchivePage() {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [logs, setLogs] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("archive_logs").select("*").order("created_at", { ascending: false }).limit(30);
    setLogs(data ?? []);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  async function run() {
    if (!confirm("Archive meal donation records older than the retention period to Google Drive now?")) return;
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/admin/archive", { method: "POST" });
      const json = await res.json();
      setMsg({ t: res.ok ? "ok" : "err", m: json.message || json.error || "Done." });
    } catch { setMsg({ t: "err", m: "Request failed. Nothing was deleted." }); }
    setBusy(false); load();
  }

  const lastOk = logs.find((l) => l.status === "success");
  return (
    <div>
      <h1 className="text-4xl font-semibold text-navy">Google Drive Archives</h1>
      <p className="mt-1 max-w-2xl text-body/70">Records older than the retention period (default 30 days) are exported to a private Google Drive folder as monthly CSV files. Rows are deleted from the database only after the upload is verified, and only if automatic deletion has been switched on by the site owner.</p>
      <div className="card mt-6 p-6">
        <p className="text-sm">Last successful archive: <strong>{lastOk ? `${lastOk.period} (${new Date(lastOk.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })})` : "none yet"}</strong></p>
        <button type="button" onClick={run} disabled={busy} className="btn-primary mt-4 disabled:opacity-60">{busy ? "Archiving…" : "Run Manual Archive"}</button>
        {msg && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${msg.t === "ok" ? "bg-green-100 text-green-800" : "bg-magenta/10 text-magenta"}`}>{msg.m}</p>}
      </div>
      <h2 className="mt-8 text-2xl font-semibold text-navy">Archive History</h2>
      <ul className="mt-3 space-y-3">
        {logs.length === 0 && <li className="rounded-2xl border border-dashed border-gold/60 p-6 text-center text-body/70">No archive runs yet.</li>}
        {logs.map((l) => (
          <li key={l.id} className="card p-4 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold text-navy">{l.period ?? "—"} · {l.drive_file_name ?? ""}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${l.status === "success" ? "bg-green-100 text-green-800" : l.status === "failed" ? "bg-magenta/10 text-magenta" : "bg-gold/25 text-gold-dark"}`}>{l.status}</span>
            </div>
            <p className="mt-1 text-body/70">Archived {l.records_archived} · Deleted {l.records_deleted} · {l.triggered_by} · {new Date(l.created_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
            {l.message && <p className="mt-1 text-body/80">{l.message}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
