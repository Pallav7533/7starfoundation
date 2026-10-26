export type HeroSlide = {
  id: string; sort_order: number; eyebrow: string; headline: string; body: string;
  image: string; detail_image: string | null; object_position: string;
  primary_label: string; primary_href: string; secondary_label: string | null; secondary_href: string | null;
  is_published: boolean;
};
export type Ashram = {
  id: string; slug: string; name: string; short_description: string; long_description: string;
  image: string; details_published: boolean; address: string | null; map_url: string | null;
  contact_phone: string | null; services: string | null; sort_order: number; is_published: boolean;
};
export type Campaign = {
  id: string; slug: string; title: string; description: string; image: string;
  cta_label: string; donate_purpose: string; sort_order: number; is_published: boolean;
};
export type GalleryItem = {
  id: string; title: string; category: string; media_type: "image" | "video";
  url: string; thumbnail: string | null; sort_order: number; is_published: boolean;
};
export type PublicDonor = {
  id: string; ashram_id: string; ashram_slug: string; donation_date: string;
  meal_session: "morning" | "evening"; donor_name: string; family_org: string | null; occasion: string | null;
};
export type Settings = {
  about: { headline: string; body: string; long: string };
  contact: { whatsapp_display: string; whatsapp_number: string; email: string; address: string };
  social: { instagram: string; facebook: string; youtube: string; threads: string };
  footer: { intro: string };
  csr: { headline: string; body: string };
  seo: { title: string; description: string };
};
export const GALLERY_CATEGORIES = [
  "Senior Citizen Care", "Annadan Seva", "Animal and Bird Care", "Community Service", "Events and Activities",
] as const;
