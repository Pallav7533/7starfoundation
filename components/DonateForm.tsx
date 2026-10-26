"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DONATION_PURPOSES, buildWhatsAppUrl, validateDonation } from "@/lib/whatsapp";

const AMOUNTS = [101, 501, 1001, 2501];

export default function DonateForm({ targets, whatsappNumber }: { targets: string[]; whatsappNumber: string }) {
  const params = useSearchParams();
  const initialPurpose = params.get("purpose");
  const [amountChoice, setAmountChoice] = useState<number | "custom">(501);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState(
    DONATION_PURPOSES.includes(initialPurpose as any) ? (initialPurpose as string) : "General Donation"
  );
  const [target, setTarget] = useState(/Meal Seva|Senior/.test(initialPurpose || "") ? "Dikra Nu Ghar Ashram" : "");
  const [error, setError] = useState("");
  const [waUrl, setWaUrl] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setWaUrl("");
    const fd = new FormData(e.currentTarget);
    if (!fd.get("consent")) { setError("Please tick the consent box so we can receive your details on WhatsApp."); return; }
    const amount = amountChoice === "custom" ? Number(custom) : amountChoice;
    const input = {
      name: String(fd.get("name") || ""), mobile: String(fd.get("mobile") || ""), amount,
      purpose, target, message: String(fd.get("message") || "").slice(0, 300),
    };
    const problem = validateDonation(input);
    if (problem) { setError(problem); return; }
    const url = buildWhatsAppUrl(input, whatsappNumber);
    setWaUrl(url);
    window.location.href = url; // WhatsApp opens; fallback link is shown below
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6 sm:p-9" noValidate>
      <div>
        <span className="label">Donation Amount (INR)</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" onClick={() => setAmountChoice(a)} aria-pressed={amountChoice === a}
              className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${amountChoice === a ? "border-magenta bg-magenta text-white" : "border-navy/20 bg-white text-navy hover:border-magenta"}`}>
              ₹{new Intl.NumberFormat("en-IN").format(a)}
            </button>
          ))}
          <button type="button" onClick={() => setAmountChoice("custom")} aria-pressed={amountChoice === "custom"}
            className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${amountChoice === "custom" ? "border-magenta bg-magenta text-white" : "border-navy/20 bg-white text-navy hover:border-magenta"}`}>
            Custom Amount
          </button>
        </div>
        {amountChoice === "custom" && (
          <input inputMode="numeric" pattern="[0-9]*" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter amount in ₹" aria-label="Custom amount in rupees" className="field mt-3" />
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Full Name</label><input id="name" name="name" autoComplete="name" required className="field" /></div>
        <div><label className="label" htmlFor="mobile">Mobile Number</label><input id="mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" required className="field" placeholder="10-digit number" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="purpose">Donation Purpose</label>
          <select id="purpose" value={purpose} onChange={(e) => setPurpose(e.target.value)} className="field">
            {DONATION_PURPOSES.map((p) => <option key={p}>{p}</option>)}
          </select></div>
        <div><label className="label" htmlFor="target">Preferred Ashram or Campaign</label>
          <select id="target" value={target} onChange={(e) => setTarget(e.target.value)} className="field">
            <option value="">No preference</option>
            {targets.map((t) => <option key={t}>{t}</option>)}
          </select></div>
      </div>
      <div><label className="label" htmlFor="message">Occasion or Message (optional)</label>
        <textarea id="message" name="message" rows={3} maxLength={300} className="field" placeholder="e.g. In memory of…, Birthday seva…" /></div>

      <label className="flex items-start gap-3 text-sm text-body/85">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-magenta" />
        <span>I agree to share these details with 7 Star Help Foundation on WhatsApp so the team can guide me.</span>
      </label>

      {error && <p role="alert" className="rounded-xl bg-magenta/10 p-3 text-sm text-magenta">{error}</p>}
      <button type="submit" className="btn-primary w-full py-4 text-base">Continue on WhatsApp</button>

      {waUrl && (
        <p className="rounded-xl bg-cream p-4 text-sm text-body/85">
          Opening WhatsApp… If nothing happens, <a className="font-semibold text-magenta underline" href={waUrl} target="_blank" rel="noopener noreferrer">tap here to open WhatsApp</a>.
          This only sends an enquiry. Your donation is not complete until you follow the foundation&apos;s guidance.
        </p>
      )}
      <p className="text-xs text-body/60">We never ask for UPI PINs, passwords or card details. Do not share them with anyone.</p>
    </form>
  );
}
