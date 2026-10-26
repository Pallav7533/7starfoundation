"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export default function ResetPassword() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState("");
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if (pw.length < 8) { setMsg("Use at least 8 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords do not match."); return; }
    const supabase = createBrowserSupabase();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { setMsg("Could not update password. Open the reset link from your email again."); return; }
    setOk(true);
    setTimeout(() => router.replace("/admin/dashboard"), 1200);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream p-5">
      <form onSubmit={submit} className="w-full max-w-md space-y-4 rounded-3xl bg-white p-8 shadow-photo">
        <h1 className="text-3xl font-semibold text-navy">Set a New Password</h1>
        <div><label className="label" htmlFor="pw">New Password</label><input id="pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="field" /></div>
        <div><label className="label" htmlFor="pw2">Confirm Password</label><input id="pw2" type="password" autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} className="field" /></div>
        {msg && <p role="alert" className="rounded-xl bg-magenta/10 p-3 text-sm text-magenta">{msg}</p>}
        {ok && <p className="rounded-xl bg-cream p-3 text-sm text-navy">Password updated. Redirecting…</p>}
        <button type="submit" className="btn-primary w-full">Update Password</button>
      </form>
    </div>
  );
}
