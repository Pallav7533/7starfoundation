/**
 * UPI payment link. When a donor scans a QR made from this link (or taps it on a phone),
 * their UPI app (GPay / PhonePe / Paytm / BHIM) opens with the amount already filled in.
 */
export function buildUpiUrl(opts: { upiId: string; payeeName: string; amount: number; note?: string }): string {
  const params = new URLSearchParams();
  params.set("pa", opts.upiId.trim());
  params.set("pn", opts.payeeName.trim() || "7 Star Help Foundation");
  params.set("am", String(Math.round(opts.amount * 100) / 100));
  params.set("cu", "INR");
  if (opts.note) params.set("tn", opts.note.slice(0, 50));
  // URLSearchParams encodes spaces as "+" and "@" as %40, but UPI apps expect %20 and a plain "@".
  return `upi://pay?${params.toString().replace(/\+/g, "%20").replace(/%40/g, "@")}`;
}

/** Basic UPI ID shape check, e.g. name@bank */
export function isValidUpiId(v: string): boolean {
  return /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z]{2,64}$/.test(v.trim());
}
