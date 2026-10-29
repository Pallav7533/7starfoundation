"use client";
import { useEffect, useState } from "react";
import { readLang } from "./GoogleTranslateLoader";

const LANGS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "gu", label: "ગુજરાતી" },
] as const;

function setCookie(value: string | null) {
  const host = window.location.hostname;
  const expire = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const base = value ? `googtrans=${value}; path=/` : `googtrans=; ${expire}; path=/`;
  document.cookie = base;
  // Google sometimes also keeps a copy on the parent domain; set/clear that too.
  if (host.includes(".")) document.cookie = `${base}; domain=.${host}`;
}

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const [lang, setLang] = useState<"en" | "hi" | "gu">("en");
  useEffect(() => { setLang(readLang()); }, []);

  function change(code: string) {
    setCookie(code === "en" ? null : `/en/${code}`);
    setLang(code as "en" | "hi" | "gu");
    window.location.reload(); // fresh load = whole site (all pages) in the chosen language
  }

  return (
    <label className={`notranslate inline-flex items-center gap-1.5 ${className}`} translate="no">
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-navy">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" />
      </svg>
      <span className="sr-only">Language / भाषा / ભાષા</span>
      <select value={lang} onChange={(e) => change(e.target.value)} aria-label="Language"
        className="h-10 cursor-pointer rounded-full border border-navy/20 bg-white px-3 text-sm font-semibold text-navy outline-none transition hover:border-magenta focus:border-magenta focus:ring-2 focus:ring-magenta/20">
        {LANGS.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
      </select>
    </label>
  );
}
