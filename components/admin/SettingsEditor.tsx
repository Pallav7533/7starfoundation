"use client";
import { useEffect, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { defaultSettings } from "@/lib/defaults";

type F = { key: string; label: string; textarea?: boolean; help?: string; url?: boolean };
type Group = { settingKey: keyof typeof defaultSettings; title: string; fields: F[] };

export default function SettingsEditor({ title, intro, groups }: { title: string; intro?: string; groups: Group[] }) {
  const supabase = useMemo(() => createBrowserSupabase(), []);
  const [values, setValues] = useState<Record<string, Record<string, string>>>({});
  const [msg, setMsg] = useState<{ t: "ok" | "err"; m: string } | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("key,value").then(({ data }) => {
      const out: Record<string, Record<string, string>> = {};
      for (const g of groups) {
        const base = (defaultSettings as any)[g.settingKey] as Record<string, string>;
        const row = data?.find((r: any) => r.key === g.settingKey)?.value as Record<string, string> | undefined;
        out[g.settingKey] = { ...base, ...(row ?? {}) };
      }
      setValues(out);
    });
  }, [supabase, groups]);

  async function save(g: Group) {
    setMsg(null);
    const v = values[g.settingKey] ?? {};
    for (const f of g.fields) {
      if (f.url && v[f.key] && !/^https?:\/\//.test(v[f.key])) { setMsg({ t: "err", m: `${f.label} must start with https://` }); return; }
    }
    const { error } = await supabase.from("site_settings").upsert({ key: g.settingKey, value: v });
    setMsg(error ? { t: "err", m: error.message } : { t: "ok", m: `${g.title} saved. It is live on the website.` });
  }

  return (
    <div>
      <h1 className="text-4xl font-semibold text-navy">{title}</h1>
      {intro && <p className="mt-1 max-w-2xl text-body/70">{intro}</p>}
      {msg && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${msg.t === "ok" ? "bg-green-100 text-green-800" : "bg-magenta/10 text-magenta"}`}>{msg.m}</p>}
      {groups.map((g) => (
        <section key={g.settingKey} className="card mt-6 space-y-4 p-5 sm:p-8">
          <h2 className="text-2xl font-semibold text-navy">{g.title}</h2>
          {g.fields.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              {f.textarea
                ? <textarea rows={4} className="field" value={values[g.settingKey]?.[f.key] ?? ""} onChange={(e) => setValues({ ...values, [g.settingKey]: { ...values[g.settingKey], [f.key]: e.target.value } })} />
                : <input className="field" value={values[g.settingKey]?.[f.key] ?? ""} onChange={(e) => setValues({ ...values, [g.settingKey]: { ...values[g.settingKey], [f.key]: e.target.value } })} />}
              {f.help && <p className="mt-1 text-xs text-body/60">{f.help}</p>}
            </div>
          ))}
          <button type="button" onClick={() => save(g)} className="btn-primary">Save {g.title}</button>
        </section>
      ))}
    </div>
  );
}
