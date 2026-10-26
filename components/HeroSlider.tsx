"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import SafeImage from "./SafeImage";
import type { HeroSlide } from "@/lib/types";
import { isSafeHref } from "@/lib/utils";

// Four distinct collage compositions (cycled by slide index).
const MAIN = [
  "rounded-t-[260px] rounded-b-[28px]",
  "rounded-[44px] rounded-tr-[180px]",
  "rounded-[999px]",
  "rounded-[28px] rounded-bl-[170px] rounded-tr-[170px]",
];
const DETAIL = [
  "left-0 bottom-6 sm:-left-6 w-[38%] aspect-[4/5] rounded-[24px]",
  "right-0 bottom-4 sm:-right-4 w-[36%] aspect-square rounded-full",
  "left-2 top-8 sm:-left-4 w-[34%] aspect-[4/5] rounded-t-[999px] rounded-b-2xl",
  "right-2 bottom-8 sm:-right-4 w-[38%] aspect-[5/4] rounded-[24px]",
];
const FEATURES = [
  { t: "Dignified Care", d: "Respect for every senior" },
  { t: "Daily Annadan", d: "Meals shared with love" },
  { t: "Living Compassion", d: "Animals, birds, community" },
];

export default function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const n = slides.length;

  const go = useCallback((to: number) => setI(((to % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || n < 2) return;
    const t = setInterval(() => setI((p) => (p + 1) % n), 8000);
    return () => clearInterval(t);
  }, [paused, n]);

  if (!n) return null;

  return (
    <section
      aria-roledescription="carousel" aria-label="Featured stories" tabIndex={0}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
      onKeyDown={(e) => { if (e.key === "ArrowLeft") go(i - 1); if (e.key === "ArrowRight") go(i + 1); }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(dx < 0 ? i + 1 : i - 1);
        touchX.current = null;
      }}
      className="relative isolate overflow-hidden bg-ivory outline-none"
    >
      {/* decorative layers */}
      <div aria-hidden className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -right-32 bottom-0 h-[480px] w-[480px] rounded-full bg-magenta/10 blur-3xl" />
      <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-cream" viewBox="0 0 1440 160" preserveAspectRatio="none">
        <path d="M0,96 C240,160 480,20 760,70 C1040,120 1240,40 1440,90 L1440,160 L0,160 Z" fill="currentColor" />
        <path d="M0,96 C240,160 480,20 760,70 C1040,120 1240,40 1440,90" fill="none" stroke="#D7A54A" strokeWidth="1.5" opacity=".6" />
      </svg>

      <div className="container-x relative">
        <div className="grid">
          {slides.map((s, idx) => {
            const active = idx === i;
            const v = idx % 4;
            return (
              <article key={s.id} aria-hidden={!active} aria-roledescription="slide"
                aria-label={`${idx + 1} of ${n}`}
                className={`col-start-1 row-start-1 grid items-center gap-8 py-8 transition-[opacity,visibility] duration-700 lg:grid-cols-12 lg:gap-6 lg:py-10 lg:min-h-[calc(100vh-96px)] lg:max-h-[860px] ${
                  active ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"}`}>
                {/* LEFT: copy */}
                <div className={`order-2 lg:order-1 lg:col-span-5 ${active ? "fade-up" : ""}`}>
                  <p className="eyebrow flex items-center gap-3"><span className="gold-rule" />{s.eyebrow}</p>
                  <h1 className="mt-4 text-[clamp(2.2rem,5.2vw,4.6rem)] font-semibold leading-[1.04] text-navy">{s.headline}</h1>
                  <p className="mt-5 max-w-lg text-base leading-relaxed text-body/85 sm:text-lg">{s.body}</p>
                  <div className="mt-7 flex flex-wrap items-center gap-3">
                    {isSafeHref(s.primary_href) && <Link href={s.primary_href} className="btn-primary px-7 py-3.5 text-base">{s.primary_label}</Link>}
                    {s.secondary_label && isSafeHref(s.secondary_href) && (
                      <Link href={s.secondary_href as string} className="btn-outline px-6 py-3.5 text-base">{s.secondary_label}</Link>
                    )}
                  </div>
                  {/* dark info panel */}
                  <div className="mt-8 hidden max-w-xl grid-cols-3 divide-x divide-white/15 overflow-hidden rounded-2xl bg-navy text-white shadow-photo sm:grid">
                    {FEATURES.map((f) => (
                      <div key={f.t} className="px-4 py-4">
                        <p className="font-serif text-base font-semibold text-gold-light">{f.t}</p>
                        <p className="mt-1 text-xs leading-snug text-white/75">{f.d}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: layered photo collage */}
                <div className="relative order-1 lg:order-2 lg:col-span-7">
                  <div className="relative mx-auto h-[270px] w-full max-w-[640px] sm:h-[400px] lg:h-[min(640px,72vh)] lg:max-w-none">
                    <div aria-hidden className="absolute inset-y-4 right-0 w-[88%] rounded-[40px] border border-gold/40" />
                    <div className={`gold-frame absolute right-3 top-0 h-[92%] w-[82%] overflow-hidden shadow-photo sm:right-6 ${MAIN[v]}`}>
                      <SafeImage src={s.image} alt={s.headline} eager={idx === 0} position={s.object_position} className="h-full w-full" />
                    </div>
                    {s.detail_image && (
                      <div className={`absolute z-10 overflow-hidden border-4 border-ivory shadow-photo ${DETAIL[v]}`}>
                        <SafeImage src={s.detail_image} alt="" className="h-full w-full" />
                      </div>
                    )}
                    {/* logo seal */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo.jpg" alt="" aria-hidden width={72} height={72}
                      className="absolute -top-1 left-2 z-20 hidden h-[72px] w-[72px] rounded-full border-4 border-ivory shadow-soft sm:block" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* controls */}
        <div className="relative z-20 flex items-center justify-between pb-6 lg:absolute lg:bottom-6 lg:left-12 lg:right-auto lg:pb-0">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => go(i - 1)} aria-label="Previous slide"
              className="grid h-12 w-12 place-items-center rounded-full border border-navy/30 bg-white/80 text-navy transition hover:border-magenta hover:bg-magenta hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" onClick={() => go(i + 1)} aria-label="Next slide"
              className="grid h-12 w-12 place-items-center rounded-full border border-navy/30 bg-white/80 text-navy transition hover:border-magenta hover:bg-magenta hover:text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
          <div className="flex items-center gap-2" role="tablist" aria-label="Choose slide">
            {slides.map((s, idx) => (
              <button key={s.id} type="button" role="tab" aria-selected={idx === i} aria-label={`Go to slide ${idx + 1}`}
                onClick={() => go(idx)}
                className={`h-2.5 rounded-full transition-all ${idx === i ? "w-9 bg-magenta" : "w-2.5 bg-navy/25 hover:bg-navy/50"}`} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
