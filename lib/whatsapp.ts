/** Fixed seva package: one-time meal for the seniors at Dikra Nu Ghar Ashram. */
export const MEAL_SEVA_PURPOSE = "One-Time Meal Seva";
export const MEAL_SEVA_AMOUNT = 2500;

export const DONATION_PURPOSES = [
  "General Donation", MEAL_SEVA_PURPOSE, "Senior Citizen Care", "Morning Meal Seva", "Evening Meal Seva",
  "Animal and Bird Care", "Community Seva", "Specific Campaign",
] as const;

export type DonationInput = {
  name: string; mobile: string; amount: number; purpose: string; target: string; message: string;
};

export function validateDonation(i: DonationInput): string | null {
  if (i.name.trim().length < 2) return "Please enter your full name.";
  if (!/^[6-9]\d{9}$/.test(i.mobile.replace(/\D/g, "").replace(/^91/, ""))) return "Please enter a valid 10-digit Indian mobile number.";
  if (!Number.isFinite(i.amount) || i.amount < 1) return "Please enter a valid donation amount.";
  if (i.amount > 10000000) return "Please contact the foundation directly for very large contributions.";
  return null;
}

export function buildWhatsAppUrl(i: DonationInput, number = "917070818112"): string {
  const amount = new Intl.NumberFormat("en-IN").format(i.amount);
  let text = `Hello 7 Star Help Foundation, I would like to contribute ₹${amount} towards ${i.purpose}`;
  if (i.target) text += ` at ${i.target}`;
  text += `. My name is ${i.name.trim()} and my mobile number is ${i.mobile.trim()}.`;
  if (i.message.trim()) text += ` Occasion/Message: ${i.message.trim()}.`;
  text += " I will share my payment screenshot here. Please guide me regarding the donation process.";
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
