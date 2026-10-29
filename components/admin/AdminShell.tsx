"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const NAV = [
  ["Dashboard", "/admin/dashboard"], ["Annadan Seva Register", "/admin/annadan"], ["Ashram Details", "/admin/ashrams"],
  ["Campaigns", "/admin/campaigns"], ["Gallery and Videos", "/admin/gallery"], ["Hero Slides", "/admin/hero"],
  ["CSR and Contact Enquiries", "/admin/enquiries"], ["Website Content", "/admin/content"], ["Social Media Links", "/admin/social"],
  ["Google Drive Archives", "/admin/archive"], ["Settings", "/admin/settings"],
];
const IDLE_MS = 30 * 60 * 1000;

export default function AdminShell({ email, children }: { email: string; children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = useCallback(async () => {
    await createBrowserSupabase().auth.signOut();
    router.replace("/admin");
    router.refresh();
  }, [router]);

  // Session expiry after 30 minutes of inactivity.
  useEffect(() => {
    let t = setTimeout(logout, IDLE_MS);
    const reset = () => { clearTimeout(t); t = setTimeout(logout, IDLE_MS); };
    const evs = ["mousemove", "keydown", "click", "touchstart"];
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => { clearTimeout(t); evs.forEach((e) => window.removeEventListener(e, reset)); };
  }, [logout]);
  useEffect(() => setOpen(false), [path]);

  return (
    <div className="min-h-screen bg-cream/60 lg:flex">
      <aside className={`${open ? "block" : "hidden"} fixed inset-0 top-14 z-40 overflow-y-auto bg-navy p-5 text-white lg:static lg:block lg:w-72 lg:shrink-0`}>
        <div className="hidden items-center gap-3 lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="" width={48} height={48} className="rounded-full" />
          <div><p className="font-serif text-lg leading-tight">7 Star Help</p><p className="text-[11px] uppercase tracking-widest text-gold-light">Admin Panel</p></div>
        </div>
        <LanguageSwitcher light className="mt-4 lg:mt-6" />
        <nav className="mt-4 space-y-1 lg:mt-4" aria-label="Admin">
          {NAV.map(([l, h]) => (
            <Link key={h} href={h} className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${path.startsWith(h) ? "bg-white text-navy" : "text-white/85 hover:bg-white/10"}`}>{l}</Link>
          ))}
          <Link href="/" target="_blank" className="block rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/10">View Website ↗</Link>
          <button type="button" onClick={logout} className="mt-3 w-full rounded-xl bg-magenta px-4 py-3 text-left text-sm font-semibold hover:bg-magenta-dark">Logout</button>
        </nav>
        <p className="mt-6 break-all text-xs text-white/50">{email}</p>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-50 flex h-14 items-center justify-between bg-navy px-4 text-white lg:hidden">
          <span className="font-serif text-lg">7 Star Admin</span>
          <button type="button" aria-label="Menu" onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full border border-white/30">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}</svg>
          </button>
        </div>
        <div className="mx-auto max-w-6xl p-4 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
