"use client";
import { useEffect, useState } from "react";
import SafeImage from "./SafeImage";
import { GALLERY_CATEGORIES, type GalleryItem } from "@/lib/types";
import { toEmbedUrl } from "@/lib/utils";

export default function GalleryGrid({ items, showFilters = true, editorial = false }: { items: GalleryItem[]; showFilters?: boolean; editorial?: boolean }) {
  const [cat, setCat] = useState<string>("All");
  const [openItem, setOpenItem] = useState<GalleryItem | null>(null);
  const shown = cat === "All" ? items : items.filter((i) => i.category === cat);

  useEffect(() => {
    if (!openItem) return;
    const f = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenItem(null); };
    window.addEventListener("keydown", f);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", f); document.body.style.overflow = ""; };
  }, [openItem]);

  return (
    <div>
      {showFilters && (
        <div className="mb-8 flex flex-wrap gap-2" role="group" aria-label="Filter gallery">
          {["All", ...GALLERY_CATEGORIES].map((c) => (
            <button key={c} type="button" onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${cat === c ? "border-magenta bg-magenta text-white" : "border-navy/20 bg-white text-navy hover:border-magenta"}`}>{c}</button>
          ))}
        </div>
      )}
      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gold/60 p-8 text-center text-body/70">No items in this category yet.</p>
      ) : (
        <ul className={`grid gap-4 ${editorial ? "grid-cols-2 md:grid-cols-4 md:auto-rows-[190px]" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
          {shown.map((it, idx) => {
            const span = editorial ? (idx % 5 === 0 ? "md:col-span-2 md:row-span-2" : idx % 5 === 3 ? "md:row-span-2" : "") : "";
            const thumb = it.media_type === "video" ? it.thumbnail || "" : it.url;
            return (
              <li key={it.id} className={span}>
                <button type="button" onClick={() => setOpenItem(it)}
                  className={`group relative block w-full overflow-hidden rounded-2xl shadow-soft ${editorial ? "h-full min-h-[160px]" : "aspect-[4/5]"}`}
                  aria-label={`Open ${it.title || it.category}`}>
                  <SafeImage src={thumb} alt={it.title || it.category} className="h-full w-full transition duration-500 group-hover:scale-105" />
                  <span className="absolute inset-0 bg-gradient-to-t from-navy/70 via-transparent to-transparent opacity-80" />
                  {it.media_type === "video" && (
                    <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-magenta shadow-soft">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  )}
                  <span className="absolute inset-x-0 bottom-0 p-3 text-left text-white">
                    <span className="block text-[11px] uppercase tracking-wider text-gold-light">{it.category}</span>
                    {it.title && <span className="block font-serif text-lg leading-tight">{it.title}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openItem && (
        <div role="dialog" aria-modal="true" aria-label={openItem.title || "Gallery item"}
          className="fixed inset-0 z-[100] grid place-items-center bg-navy/90 p-4" onClick={() => setOpenItem(null)}>
          <button type="button" aria-label="Close" onClick={() => setOpenItem(null)}
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white text-navy">✕</button>
          <div className="max-h-[88vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            {openItem.media_type === "video" ? (
              toEmbedUrl(openItem.url) ? (
                <iframe src={toEmbedUrl(openItem.url) as string} title={openItem.title || "Video"} className="aspect-video w-full rounded-2xl bg-black"
                  allow="encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" />
              ) : (
                <video src={openItem.url} controls playsInline preload="metadata" className="max-h-[80vh] w-full rounded-2xl bg-black" />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={openItem.url} alt={openItem.title || openItem.category} className="mx-auto max-h-[80vh] w-auto rounded-2xl object-contain" />
            )}
            {openItem.title && <p className="mt-3 text-center font-serif text-xl text-white">{openItem.title}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
