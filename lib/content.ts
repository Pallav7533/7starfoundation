import { getPublicClient } from "./supabase/public";
import { defaultAshrams, defaultCampaigns, defaultHero, defaultSettings } from "./defaults";
import type { Ashram, Campaign, GalleryItem, HeroSlide, PublicDonor, Settings } from "./types";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const db = getPublicClient();
  if (!db) return defaultHero;
  const { data, error } = await db.from("hero_slides").select("*").eq("is_published", true).order("sort_order");
  return !error && data && data.length ? (data as HeroSlide[]) : defaultHero;
}

export async function getAshrams(): Promise<Ashram[]> {
  const db = getPublicClient();
  if (!db) return defaultAshrams;
  const { data, error } = await db.from("ashrams").select("*").eq("is_published", true).order("sort_order");
  return !error && data && data.length ? (data as Ashram[]) : defaultAshrams;
}

export async function getAshram(slug: string): Promise<Ashram | null> {
  const all = await getAshrams();
  return all.find((a) => a.slug === slug) ?? null;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const db = getPublicClient();
  if (!db) return defaultCampaigns;
  const { data, error } = await db.from("campaigns").select("*").eq("is_published", true).order("sort_order");
  return !error && data && data.length ? (data as Campaign[]) : defaultCampaigns;
}

export async function getGallery(): Promise<GalleryItem[]> {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db.from("gallery_items").select("*").eq("is_published", true).order("sort_order");
  return !error && data ? (data as GalleryItem[]) : [];
}

export async function getSettings(): Promise<Settings> {
  const db = getPublicClient();
  if (!db) return defaultSettings;
  const { data, error } = await db.from("site_settings").select("key,value");
  if (error || !data) return defaultSettings;
  const merged: any = { ...defaultSettings };
  for (const row of data) {
    if (row.key in merged) merged[row.key] = { ...(merged as any)[row.key], ...(row.value as object) };
  }
  return merged as Settings;
}

/** IST calendar date as YYYY-MM-DD. */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** Published donors from the privacy-safe view. Never falls back to fake data. */
export async function getPublishedDonors(opts: { date: string; ashramSlug?: string; session?: string }): Promise<PublicDonor[]> {
  const db = getPublicClient();
  if (!db) return [];
  let q = db.from("public_meal_donors")
    .select("id,ashram_id,ashram_slug,donation_date,meal_session,donor_name,family_org,occasion")
    .eq("donation_date", opts.date)
    .order("donor_name");
  if (opts.ashramSlug) q = q.eq("ashram_slug", opts.ashramSlug);
  if (opts.session === "morning" || opts.session === "evening") q = q.eq("meal_session", opts.session);
  const { data, error } = await q;
  if (error) return [];
  return (data ?? []) as PublicDonor[];
}
