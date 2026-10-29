"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createBrowserSupabase } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const fails = useRef({ n: 0, until: 0 });

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    if (Date.now() < fails.current.until) { setError("Too many attempts. Please wait a minute and try again."); return; }
    setBusy(true);
    let success = false;
    try {
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) {
        fails.current.n += 1;
        if (fails.current.n >= 5) { fails.current = { n: 0, until: Date.now() + 60_000 }; }
        setError("Incorrect email or password.");
        return;
      }
      const { data: row } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
      if (!row) { await supabase.auth.signOut(); setError("This account is not authorised for the admin panel."); return; }
      // Stay on "Signing in…" until the dashboard actually opens (no fake idle button),
      // and navigate once (the extra router.refresh() made the server do all the work twice).
      success = true;
      router.replace("/admin/dashboard");
    } catch {
      setError("Could not sign in. Please check your connection and try again.");
    } finally {
      if (!success) setBusy(false);
    }
  }

  async function forgot() {
    setError(""); setInfo("");
    if (!email.trim()) { setError("Enter your admin email above first."); return; }
    const supabase = createBrowserSupabase();
    await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/callback?next=/admin/reset` });
    setInfo("If this email belongs to the administrator, a password reset link has been sent.");
  }

  return (
    <div className="relative grid min-h-screen place-items-center bg-gradient-to-br from-cream via-ivory to-gold/20 p-5">
      <LanguageSwitcher className="absolute right-4 top-4" />
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-photo sm:p-10">
        <div className="text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="7 Star Help Foundation" width={84} height={84} className="mx-auto rounded-full" />
          <h1 className="mt-4 text-3xl font-semibold text-navy">Admin Login</h1>
          <p className="mt-1 text-sm text-body/70">7 Star Help Foundation</p>
        </div>
        <form onSubmit={login} className="mt-8 space-y-4">
          <div><label className="label" htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className="field" /></div>
          <div><label className="label" htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="field" /></div>
          {error && <p role="alert" className="rounded-xl bg-magenta/10 p-3 text-sm text-magenta">{error}</p>}
          {info && <p className="rounded-xl bg-cream p-3 text-sm text-navy">{info}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full py-3.5 disabled:opacity-60">{busy ? "Signing in…" : "Sign In"}</button>
          <button type="button" onClick={forgot} className="w-full text-center text-sm font-semibold text-magenta hover:underline">Forgot password?</button>
        </form>
        <p className="mt-6 text-center text-xs text-body/50"><Link href="/" className="hover:underline">← Back to website</Link></p>
      </div>
    </div>
  );
}
