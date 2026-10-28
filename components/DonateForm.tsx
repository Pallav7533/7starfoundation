"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DONATION_PURPOSES, MEAL_SEVA_AMOUNT, MEAL_SEVA_PURPOSE, buildWhatsAppUrl, validateDonation,
} from "@/lib/whatsapp";
import UpiPayCard from "./UpiPayCard";

const AMOUNTS = [101, 501, 1001, 2501];
const rupees = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export default function DonateForm({
  targets, whatsappNumber, upiId = "", payeeName = "7 Star Help Foundation",
}: { targets: string[]; whatsappNumber: string; upiId?: string; payeeName?: string }) {
  const params = useSearchParams();
  const initialPurpose = params.get("purpose");
  const dikra = targets.find((t) => /dikra/i.test(t)) ?? "";

  const startsWithMeal = initialPurpose === MEAL_SEVA_PURPOSE;
  const [amountChoice, setAmountChoice] = useState<number | "custom">(startsWithMeal ? MEAL_SEVA_AMOUNT : 501);
  const [custom, setCustom] = useState("");
  const [purpose, setPurpose] = useState(
    DONATION_PURPOSES.includes(initialPurpose as any) ? (initialPurpose as string) : "General Donation"
  );
  const [target, setTarget] = useState(/Meal Seva|Senior/.test(initialPurpose || "") ? dikra : "");
  const [error, setError] = useState("");
  const [waUrl, setWaUrl] = useState("");

  const amount = amountChoice === "custom" ? Number(custom) : amountChoice;
  const mealSevaOn = purpose === MEAL_SEVA_PURPOSE && amountChoice === MEAL_SEVA_AMOUNT;

  function chooseAmount(a: number | "custom") {
    setAmountChoice(a);
    // Leaving the fixed ₹2,500 package: go back to a normal donation.
    if (purpose === MEAL_SEVA_PURPOSE) setPurpose("General Donation");
  }
  function chooseMealSeva() {
    setAmountChoice(MEAL_SEVA_AMOUNT);
    setPurpose(MEAL_SEVA_PURPOSE);
    if (dikra) setTarget(dikra);
  }
  function choosePurpose(p: string) {
    if (p === MEAL_SEVA_PURPOSE) { chooseMealSeva(); return; }
    setPurpose(p);
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setWaUrl("");
    const fd = new FormData(e.currentTarget);
    if (!fd.get("consent")) { setError("Please tick the consent box so we can receive your details on WhatsApp."); return; }
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

  const chip = (on: boolean) =>
    `rounded-xl border px-3 py-3 text-sm font-semibold transition ${on ? "border-magenta bg-magenta text-white" : "border-navy/20 bg-white text-navy hover:border-magenta"}`;

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-6 sm:p-9" noValidate>
      {/* Fixed seva package */}
      <button type="button" onClick={chooseMealSeva} aria-pressed={mealSevaOn}
        className={`flex w-full items-center justify-between gap-4 rounded-2xl border-2 p-4 text-left transition sm:p-5 ${
          mealSevaOn ? "border-magenta bg-magenta/5" : "border-gold/60 bg-cream hover:border-magenta"}`}>
        <span>
          <span className="eyebrow block">Dikra Nu Ghar Ashram</span>
          <span className="mt-1 block font-serif text-xl font-semibold text-navy sm:text-2xl">One-Time Meal Seva</span>
          <span className="mt-1 block text-sm text-body/80">Sponsor one meal for the senior citizens.</span>
        </span>
        <span className="shrink-0 rounded-full bg-navy px-4 py-2 text-base font-semibold text-white">₹{rupees(MEAL_SEVA_AMOUNT)}</span>
      </button>

      <div>
        <span className="label">Donation Amount (INR)</span>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {AMOUNTS.map((a) => (
            <button key={a} type="button" onClick={() => chooseAmount(a)} aria-pressed={amountChoice === a && !mealSevaOn}
              className={chip(amountChoice === a && !mealSevaOn)}>
              ₹{rupees(a)}
            </button>
          ))}
          <button type="button" onClick={() => chooseAmount("custom")} aria-pressed={amountChoice === "custom"}
            className={chip(amountChoice === "custom")}>
            Custom Amount
          </button>
        </div>
        {amountChoice === "custom" && (
          <input inputMode="numeric" pattern="[0-9]*" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter amount in ₹" aria-label="Custom amount in rupees" className="field mt-3" />
        )}
      </div>

      {/* QR scanner with the chosen amount */}
      <UpiPayCard amount={amount} note={purpose} upiId={upiId} payeeName={payeeName} />
      <p className="-mt-3 text-center text-xs text-body/60">After paying, fill in your details below and send them on WhatsApp with your payment screenshot.</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="name">Full Name</label><input id="name" name="name" autoComplete="name" required className="field" /></div>
        <div><label className="label" htmlFor="mobile">Mobile Number</label><input id="mobile" name="mobile" type="tel" inputMode="tel" autoComplete="tel" required className="field" placeholder="10-digit number" /></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="purpose">Donation Purpose</label>
          <select id="purpose" value={purpose} onChange={(e) => choosePurpose(e.target.value)} className="field">
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
      <button type="submit" className="btn-primary w-full py-4 text-base">Send Details on WhatsApp</button>

      {waUrl && (
        <p className="rounded-xl bg-cream p-4 text-sm text-body/85">
          Opening WhatsApp… If nothing happens, <a className="font-semibold text-magenta underline" href={waUrl} target="_blank" rel="noopener noreferrer">tap here to open WhatsApp</a>.
          Please share your payment screenshot there so the team can confirm your donation.
        </p>
      )}
      <p className="text-xs text-body/60">We never ask for UPI PINs, passwords or card details. Do not share them with anyone.</p>
    </form>
  );
}
