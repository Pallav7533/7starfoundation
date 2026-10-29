"use client";
import { useEffect } from "react";

/**
 * Loads the Google Translate engine ONLY when the visitor has picked Hindi or Gujarati.
 * English visitors download nothing extra, so the site stays fast.
 * The language is stored in the standard "googtrans" cookie (e.g. /en/hi), see LanguageSwitcher.
 */
export function readLang(): "en" | "hi" | "gu" {
  try {
    const m = document.cookie.match(/(?:^|;\s*)googtrans=\/[a-z-]+\/([a-z-]+)/i);
    const c = m?.[1];
    return c === "hi" || c === "gu" ? c : "en";
  } catch { return "en"; }
}

export default function GoogleTranslateLoader() {
  useEffect(() => {
    if (readLang() === "en") return;
    const w = window as any;

    // Google Translate wraps text in <font> tags. Without this guard React can throw
    // "removeChild / insertBefore" errors when it later updates the same text.
    if (!w.__gtPatched) {
      w.__gtPatched = true;
      const rm = Node.prototype.removeChild;
      Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
        if (child.parentNode !== this) return child;
        return rm.call(this, child) as T;
      };
      const ib = Node.prototype.insertBefore;
      Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
        if (ref && ref.parentNode !== this) return node;
        return ib.call(this, node, ref) as T;
      };
    }

    w.googleTranslateElementInit = () => {
      try {
        new w.google.translate.TranslateElement(
          { pageLanguage: "en", includedLanguages: "en,hi,gu", autoDisplay: false },
          "google_translate_element"
        );
      } catch { /* site simply stays in English */ }
    };
    if (document.getElementById("gt-script")) return;
    const s = document.createElement("script");
    s.id = "gt-script";
    s.async = true;
    s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(s);
  }, []);

  return (
    <div id="google_translate_element" translate="no" aria-hidden="true"
      style={{ position: "absolute", left: "-9999px", top: 0, height: 0, overflow: "hidden" }} />
  );
}
