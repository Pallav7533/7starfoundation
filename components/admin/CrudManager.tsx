"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";

export type Field = {
  key: string; label: string; type?: "text" | "textarea" | "select" | "checkbox" | "number" | "image";
  options?: string[]; help?: string; required?: boolean; nullable?: boolean;
};

export default function CrudManager({
  table, title, intro, fields, titleKey, subtitleKey, defaults, orderBy = "sort_order", canCreate = true, canDelete = true,
}: {
  table: string; title: string; intro?: string; fields: Field[]; titleKey: string; subtitleKey?: string;
  defaults: Record<string, any>; orderBy?: string; canCreate?: boolean; canDelete?: boolean;
}) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any> | null>(null);
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order(orderBy, { ascending: true });
    if (error) setMsg({ t: "err", m: error.message });
    setRows(data ?? []); setLoading(false);
  }, [supabase, table, orderBy]);
  useEffect(() => { load(); }, [load]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setMsg(null);
    const payload: Record<string, any> = {};
    for (const f of fields) {
      let v = form[f.key];
      if (f.type === "number") v = v === "" || v === null || v === undefined ? 0 : Number(v);
      if (f.type === "checkbox") v = !!v;
      if ((f.type === undefined || f.type === "text" || f.type === "textarea" || f.type === "image") && typeof v === "string") {
        v = v.trim();
        if (f.nullable && v === "") v = null;
      }
      if (f.required && (v === "" || v === null || v === undefined)) { setMsg({ t: "err", m: `${f.label} is required.` }); return; }
      payload[f.key] = v;
    }
    const res = form.id ? await supabase.from(table).update(payload).eq("id", form.id) : await supabase.from(table).insert(payload);
    if (res.error) { setMsg({ t: "err", m: res.error.message }); return; }
    setMsg({ t: "ok", m: "Saved. The change is live on the website." });
    setForm(null); load();
  }

  async function remove(r: any) {
    if (!confirm(`Delete "${r[titleKey]}"? This cannot be undone.`)) return;
    const { error } = await supabase.from(table).delete().eq("id", r.id);
    if (error) setMsg({ t: "err", m: error.message }); else load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h1 className="text-4xl font-semibold text-navy">{title}</h1>{intro && <p className="mt-1 max-w-2xl text-body/70">{intro}</p>}</div>
        {canCreate && !form && <button type="button" onClick={() => setForm({ ...defaults })} className="btn-primary">+ Add New</button>}
      </div>
      {msg && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${msg.t === "ok" ? "bg-green-100 text-green-800" : "bg-magenta/10 text-magenta"}`}>{msg.m}</p>}

      {form && (
        <form onSubmit={save} className="card mt-6 space-y-4 p-5 sm:p-8">
          <h2 className="text-2xl font-semibold text-navy">{form.id ? "Edit" : "Add"}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {fields.map((f) => {
              const full = f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : "";
              const val = form[f.key] ?? (f.type === "checkbox" ? false : "");
              return (
                <div key={f.key} className={full}>
                  {f.type === "checkbox" ? (
                    <label className="flex items-center gap-3 pt-6 text-sm font-medium"><input type="checkbox" checked={!!val} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} className="h-4 w-4 accent-magenta" />{f.label}</label>
                  ) : (
                    <>
                      <label className="label">{f.label}{f.required ? " *" : ""}</label>
                      {f.type === "textarea" ? <textarea rows={4} value={val} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="field" />
                        : f.type === "select" ? <select value={val} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="field">{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
                        : <input type={f.type === "number" ? "number" : "text"} value={val} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="field" />}
                      {f.type === "image" && val && /^(\/|https?:)/.test(String(val)) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={String(val)} alt="Preview" className="mt-2 h-24 w-auto rounded-lg border border-navy/10 object-cover" onError={(e) => ((e.target as HTMLImageElement).style.display = "none")} />
                      )}
                      {f.help && <p className="mt-1 text-xs text-body/60">{f.help}</p>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary">Save</button><button type="button" onClick={() => setForm(null)} className="btn-outline">Cancel</button></div>
        </form>
      )}

      <ul className="mt-6 space-y-3">
        {loading && <li className="text-sm text-body/60">Loading…</li>}
        {!loading && rows.length === 0 && <li className="rounded-2xl border border-dashed border-gold/60 p-6 text-center text-body/70">Nothing here yet.</li>}
        {rows.map((r) => (
          <li key={r.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate font-serif text-xl font-semibold text-navy">{r[titleKey]}</p>
              {subtitleKey && <p className="truncate text-sm text-body/60">{r[subtitleKey]}</p>}
              {"is_published" in r && <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.is_published ? "bg-green-100 text-green-800" : "bg-gold/25 text-gold-dark"}`}>{r.is_published ? "Published" : "Draft"}</span>}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm({ ...r }); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="btn-outline px-4 py-2">Edit</button>
              {canDelete && <button onClick={() => remove(r)} className="btn border border-magenta px-4 py-2 text-magenta">Delete</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
