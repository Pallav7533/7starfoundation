"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";

type Item = { label: string; href: string };

export default function Header({ ashrams, campaigns }: { ashrams: Item[]; campaigns: Item[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 8);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const active = (href: string) => (href === "/" ? path === "/" : path.startsWith(href.split("#")[0]));
  const link = (href: string) =>
    `relative px-1 py-2 text-[13px] font-semibold tracking-wide transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-magenta after:transition-transform hover:text-magenta hover:after:scale-x-100 ${
      active(href) ? "text-magenta after:scale-x-100" : "text-navy"}`;

  const dropdown = (label: string, base: string, items: Item[]) => (
    <div className="group relative">
      <Link href={base} className={`${link(base)} inline-flex items-center gap-1`}>
        {label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M6 9l6 6 6-6" /></svg>
      </Link>
      <div className="invisible absolute left-1/2 top-full z-50 w-64 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-2xl border border-gold/40 bg-ivory p-2 shadow-photo">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-navy hover:bg-cream hover:text-magenta">{it.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
    <header className={`sticky top-0 z-50 border-b border-gold/30 bg-ivory/95 backdrop-blur transition-shadow ${scrolled ? "shadow-soft" : ""}`}>
      <div className="container-x flex h-[76px] items-center justify-between gap-4">
        <Logo size={52} />
        <nav aria-label="Main" className="hidden items-center gap-5 xl:flex">
          <Link href="/" className={link("/")}>Home</Link>
          <Link href="/about" className={link("/about")}>About Us</Link>
          {dropdown("Our Ashrams", "/ashrams/dikra-nu-ghar", ashrams)}
          {dropdown("Our Campaigns", "/campaigns", campaigns)}
          <Link href="/community" className={link("/community")}>Community</Link>
          <Link href="/annadan-seva" className={link("/annadan-seva")}>Annadan Seva</Link>
          <Link href="/csr" className={link("/csr")}>CSR</Link>
          <Link href="/gallery" className={link("/gallery")}>Gallery</Link>
          <Link href="/contact" className={link("/contact")}>Contact Us</Link>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link href="/donate" className="btn-primary px-5 py-2.5">Donate Now</Link>
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="grid h-11 w-11 place-items-center rounded-full border border-navy/20 text-navy xl:hidden">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

    </header>

      {open && (
        <div className="fixed inset-x-0 bottom-0 top-[76px] z-40 overflow-y-auto bg-ivory xl:hidden">
          <nav aria-label="Mobile" className="container-x flex flex-col py-4">
            <LanguageSwitcher className="mb-2 sm:hidden" />
            {[
              ["Home", "/"], ["About Us", "/about"], ["Community", "/community"], ["Annadan Seva", "/annadan-seva"],
              ["CSR", "/csr"], ["Gallery", "/gallery"], ["Contact Us", "/contact"],
            ].map(([l, h]) => (
              <Link key={h} href={h} className={`border-b border-navy/10 py-3.5 font-serif text-xl ${active(h) ? "text-magenta" : "text-navy"}`}>{l}</Link>
            ))}
            <p className="eyebrow mt-6">Our Ashrams</p>
            {ashrams.map((a) => <Link key={a.href} href={a.href} className="border-b border-navy/10 py-3 text-navy">{a.label}</Link>)}
            <p className="eyebrow mt-6">Our Campaigns</p>
            {campaigns.map((a) => <Link key={a.href} href={a.href} className="border-b border-navy/10 py-3 text-navy">{a.label}</Link>)}
            <Link href="/donate" className="btn-primary mt-8 py-4 text-base">Donate Now</Link>
          </nav>
        </div>
      )}
    </>
  );
}
