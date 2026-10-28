"use client";
import { useEffect, useState } from "react";
import { buildUpiUrl, isValidUpiId } from "@/lib/upi";

/**
 * Payment card shown on the Donate page.
 *
 * MODE 1 (best): UPI_ID is set  -> a fresh QR is generated for the chosen amount, so when the donor
 *                scans it, GPay / PhonePe / Paytm opens with the amount ALREADY filled in.
 * MODE 2 (fallback): no UPI_ID  -> the foundation's own QR photo (public/images/upi-qr.png) is shown
 *                and the donor is told which amount to type after scanning (a photo cannot change its amount).
 */
export default function UpiPayCard({
  amount, note, upiId, payeeName, staticQrSrc = "/images/upi-qr.png",
}: {
  amount: number; note: string; upiId: string; payeeName: string; staticQrSrc?: string;
}) {
  const [qr, setQr] = useState("");
  const [staticFailed, setStaticFailed] = useState(false);
  const validAmount = Number.isFinite(amount) && amount >= 1 && amount <= 10000000;
  const dynamic = isValidUpiId(upiId);
  const upiUrl = dynamic && validAmount ? buildUpiUrl({ upiId, payeeName, amount, note }) : "";

  useEffect(() => {
    if (!upiUrl) { setQr(""); return; }
    let cancelled = false;
    // Loaded only when needed, so it never slows down the first page load.
    import("qrcode")
      .then((m) => m.toDataURL(upiUrl, { width: 320, margin: 2, errorCorrectionLevel: "M" }))
      .then((d) => { if (!cancelled) setQr(d); })
      .catch(() => { if (!cancelled) setQr(""); });
    return () => { cancelled = true; };
  }, [upiUrl]);

  const shown = new Intl.NumberFormat("en-IN").format(validAmount ? amount : 0);

  return (
    <div className="rounded-2xl border border-gold/50 bg-cream p-5 text-center sm:p-7">
      <p className="eyebrow">Scan &amp; Donate</p>
      <p className="mt-2 font-serif text-4xl font-semibold text-navy">₹{shown}</p>

      {!validAmount && <p className="mt-3 text-sm text-body/75">Choose or enter an amount above to get your QR code.</p>}

      {validAmount && dynamic && (
        <>
          <div className="mx-auto mt-4 grid h-64 w-64 place-items-center rounded-2xl bg-white p-2 shadow-soft">
            {qr
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={qr} alt={`UPI QR code to donate ₹${shown}`} width={240} height={240} className="h-60 w-60" />
              : <div className="h-60 w-60 animate-pulse rounded-xl bg-navy/10" aria-label="Preparing QR code" />}
          </div>
          <p className="mt-3 text-sm text-body/85">
            Scan with any UPI app. The amount <strong>₹{shown}</strong> fills in automatically.
          </p>
          <a href={upiUrl} className="btn-primary mt-4 w-full max-w-xs md:hidden">Pay ₹{shown} with UPI app</a>
          <p className="mt-3 text-xs text-body/60">UPI ID: <span className="font-semibold text-navy">{upiId}</span></p>
        </>
      )}

      {validAmount && !dynamic && !staticFailed && (
        <>
          <div className="mx-auto mt-4 w-64 rounded-2xl bg-white p-2 shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={staticQrSrc} alt="Foundation UPI QR code" width={240} height={240}
              className="h-auto w-full" onError={() => setStaticFailed(true)} />
          </div>
          <p className="mt-3 text-sm text-body/85">
            Scan with any UPI app and enter <strong>₹{shown}</strong> as the amount.
          </p>
        </>
      )}

      {validAmount && !dynamic && staticFailed && (
        <p className="mt-3 text-sm text-body/75">QR code will be available soon. Please continue on WhatsApp and the team will share the payment details.</p>
      )}
    </div>
  );
}
