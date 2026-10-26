"use client";
import { useState } from "react";

/** <img> that never shows a broken icon: falls back to a branded placeholder block. */
export default function SafeImage({
  src, alt, className = "", position = "center", eager = false,
}: { src: string; alt: string; className?: string; position?: string; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed || !src) {
    return (
      <div role="img" aria-label={alt}
        className={`bg-gradient-to-br from-magenta to-navy ${className}`} />
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`} style={{ objectPosition: position }} />
  );
}
