"use client";
import { useCallback, useEffect, useState } from "react";
import DonorPanel from "./DonorPanel";
import type { PublicDonor } from "@/lib/types";
import { shiftDate } from "@/lib/utils";

export default function AnnadanRegister({ today, ashrams }: { today: string; ashrams: { slug: string; name: string }[] }) {
  const [date, setDate] = useState(today);
  const [session, setSession] = useState<"all" | "morning" | "evening">("all");
  const [ashram, setAshram] = useState("dikra-nu-ghar");
  const [donors, setDonors] = useState<PublicDonor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const qs = new URLSearchParams({ date, ashram, session });
      const res = await fetch(`/api/donors?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = await res.json();
      setDonors(json.donors ?? []);
    } catch { setError(true); setDonors([]); }
    finally { setLoading(false); }
  }, [date, ashram, session]);

  useEffect(() => { load(); }, [load]);

  const morning = donors.filter((d) => d.meal_session === "morning");
  const evening = donors.filter((d) => d.meal_session === "evening");

  return (
    <div>
      <div className="card grid gap-4 p-5 sm:p-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <label className="label" htmlFor="date">Donation Date</label>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous day" onClick={() => setDate(shiftDate(date, -1))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy/20 text-navy hover:border-magenta">‹</button>
            <input id="date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="field" />
            <button type="button" aria-label="Next day" onClick={() => setDate(shiftDate(date, 1))} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-navy/20 text-navy hover:border-magenta">›</button>
          </div>
          {date !== today && <button type="button" onClick={() => setDate(today)} className="mt-2 text-sm font-semibold text-magenta hover:underline">Jump to today</button>}
        </div>
        <div>
          <label className="label" htmlFor="session">Meal Session</label>
          <select id="session" value={session} onChange={(e) => setSession(e.target.value as any)} className="field">
            <option value="all">All</option><option value="morning">Morning</option><option value="evening">Evening</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="ashram">Ashram</label>
          <select id="ashram" value={ashram} onChange={(e) => setAshram(e.target.value)} className="field">
            <option value="all">All</option>
            {ashrams.map((a) => <option key={a.slug} value={a.slug}>{a.name.replace(" Ashram", "")}</option>)}
          </select>
        </div>
      </div>

      <div className={`mt-8 grid gap-6 ${session === "all" ? "md:grid-cols-2" : ""}`}>
        {session !== "evening" && <DonorPanel session="morning" date={date} donors={morning} loading={loading} error={error} />}
        {session !== "morning" && <DonorPanel session="evening" date={date} donors={evening} loading={loading} error={error} dark />}
      </div>
    </div>
  );
}
