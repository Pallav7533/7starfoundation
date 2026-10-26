"use client";
import { useState } from "react";

export default function EnquiryForm({ kind }: { kind: "contact" | "csr" }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending"); setMsg("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...body, kind }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      setState("done");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setState("error"); setMsg(err.message || "Something went wrong.");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-gold/50 bg-white p-8 text-center shadow-soft">
        <p className="font-serif text-2xl text-navy">Thank you for reaching out.</p>
        <p className="mt-2 text-sm text-body/80">Your message has been received. The foundation team will contact you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8" noValidate={false}>
      {/* honeypot for bots */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {kind === "csr" ? (
        <>
          <div><label className="label" htmlFor="company">Company / Organisation</label><input id="company" name="company" required className="field" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="contact_person">Contact Person</label><input id="contact_person" name="contact_person" required className="field" /></div>
            <div><label className="label" htmlFor="phone">Mobile Number</label><input id="phone" name="phone" type="tel" required className="field" /></div>
          </div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="field" /></div>
          <div><label className="label" htmlFor="interest">I am interested in</label>
            <select id="interest" name="interest" className="field"><option>CSR collaboration</option><option>Volunteering</option><option>Sponsoring Annadan Seva</option><option>Other</option></select></div>
          <div><label className="label" htmlFor="message">Message</label><textarea id="message" name="message" rows={4} className="field" /></div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="name">Your Name</label><input id="name" name="name" required className="field" /></div>
            <div><label className="label" htmlFor="phone">Mobile Number</label><input id="phone" name="phone" type="tel" className="field" /></div>
          </div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" className="field" /></div>
          <div><label className="label" htmlFor="message">Message</label><textarea id="message" name="message" rows={5} required className="field" /></div>
        </>
      )}
      {state === "error" && <p role="alert" className="rounded-xl bg-magenta/10 p-3 text-sm text-magenta">{msg}</p>}
      <button type="submit" disabled={state === "sending"} className="btn-primary w-full disabled:opacity-60">
        {state === "sending" ? "Sending…" : kind === "csr" ? "Send CSR Enquiry" : "Send Message"}
      </button>
    </form>
  );
}
