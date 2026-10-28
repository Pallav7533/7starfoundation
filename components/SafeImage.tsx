"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * How much mismatch between the photo shape and the frame shape we accept before we stop cropping.
 * 1.35 means: up to about 25% of the photo may be trimmed at the edges (looks like a normal, tidy crop).
 * Make it bigger (e.g. 1.6) = frame always filled but more photo trimmed.
 * Make it smaller (e.g. 1.15) = less trimming, but blurred side-bars appear more often.
 */
const MAX_MISMATCH = 1.35;

/**
 * <img> that never shows a broken icon, fills its frame, and never cuts a photo badly.
 *
 * - Photo shape is close to the frame shape  -> fills the frame edge to edge (tiny, invisible trim).
 * - Photo shape is very different (e.g. tall portrait in a wide frame) -> whole photo is shown,
 *   and the empty sides are filled with a soft blurred copy of the same photo.
 *
 * fit="cover" forces edge-to-edge crop (use for full-bleed backgrounds only).
 */
export default function SafeImage({
  src, alt, className = "", position = "center", eager = false, fit = "auto",
}: {
  src: string; alt: string; className?: string; position?: string; eager?: boolean;
  fit?: "auto" | "cover";
}) {
  const [failed, setFailed] = useState(false);
  const [blur, setBlur] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  const decide = useCallback(() => {
    const w = wrap.current, i = img.current;
    if (!w || !i || !i.naturalWidth || !w.clientHeight) return;
    const frame = w.clientWidth / w.clientHeight;
    const photo = i.naturalWidth / i.naturalHeight;
    setBlur(Math.max(frame / photo, photo / frame) > MAX_MISMATCH);
  }, []);

  useEffect(() => {
    if (fit === "cover") return;
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, [decide, fit, src]);

  if (failed || !src) {
    return <div role="img" aria-label={alt} className={`bg-gradient-to-br from-magenta to-navy ${className}`} />;
  }

  const loading = eager ? "eager" : "lazy";

  if (fit === "cover") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} loading={loading} decoding="async" onError={() => setFailed(true)}
        className={`object-cover ${className}`} style={{ objectPosition: position }} />
    );
  }

  return (
    <div ref={wrap} className={`relative overflow-hidden bg-navy/10 ${className}`}>
      {blur && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" aria-hidden="true" loading={loading} decoding="async"
          className="absolute inset-0 h-full w-full scale-125 object-cover blur-2xl" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={img} src={src} alt={alt} loading={loading} decoding="async" fetchPriority={eager ? "high" : "auto"}
        onLoad={decide} onError={() => setFailed(true)}
        className={`absolute inset-0 h-full w-full ${blur ? "object-contain" : "object-cover"}`}
        style={blur ? undefined : { objectPosition: position }} />
    </div>
  );
}
