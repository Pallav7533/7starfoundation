import type { Ashram, Campaign, HeroSlide, Settings } from "./types";

/** Fallbacks used ONLY when the database is not configured or empty. Editable content lives in Supabase. */
export const defaultHero: HeroSlide[] = [
  { id: "d1", sort_order: 1, eyebrow: "Senior Citizen Care", headline: "A Little Kindness Can Change a Life.",
    body: "Every act of care brings dignity, companionship, and hope to the lives of senior citizens who deserve to feel at home.",
    image: "/images/1.jpg", detail_image: "/images/hero-detail-1.jpg", object_position: "center 25%",
    primary_label: "Donate Now", primary_href: "/donate", secondary_label: "Explore Our Ashrams", secondary_href: "/ashrams/dikra-nu-ghar", is_published: true },
  { id: "d2", sort_order: 2, eyebrow: "Animals and Birds", headline: "Every Living Being Deserves Compassion.",
    body: "Stand with us to support the care, protection, and well-being of animals and birds in need.",
    image: "/images/2.jpg", detail_image: "/images/hero-detail-2.jpg", object_position: "center",
    primary_label: "Support Animal Care", primary_href: "/donate?purpose=Animal%20and%20Bird%20Care", secondary_label: "Discover Our Seva", secondary_href: "/campaigns", is_published: true },
  { id: "d3", sort_order: 3, eyebrow: "Annadan Seva", headline: "A Meal Shared Is Love Multiplied.",
    body: "Help bring nourishing meals, warmth, and togetherness to the senior citizens at Dikra Nu Ghar Ashram.",
    image: "/images/3.jpg", detail_image: "/images/hero-detail-3.jpg", object_position: "center",
    primary_label: "Support Annadan Seva", primary_href: "/donate?purpose=Morning%20Meal%20Seva", secondary_label: "View Daily Meal Donors", secondary_href: "/annadan-seva", is_published: true },
  { id: "d4", sort_order: 4, eyebrow: "Community Service", headline: "Together, We Can Make Kindness Go Further.",
    body: "Every contribution can help strengthen a community built on compassion, care, and shared responsibility.",
    image: "/images/4.jpg", detail_image: "/images/hero-detail-4.jpg", object_position: "center",
    primary_label: "Make a Difference", primary_href: "/donate?purpose=Community%20Seva", secondary_label: "Learn About Our Foundation", secondary_href: "/about", is_published: true },
];

export const defaultAshrams: Ashram[] = [
  { id: "a1", slug: "dikra-nu-ghar", name: "Dikra Nu Ghar Ashram",
    short_description: "Dedicated to the care, dignity, companionship, and well-being of senior citizens.",
    long_description: "Dikra Nu Ghar Ashram is dedicated to the care, dignity, companionship, and well-being of senior citizens. Detailed information will be added by the foundation.",
    image: "/images/dikra-nu-ghar.jpg", details_published: false, address: null, map_url: null, contact_phone: null, services: null, sort_order: 1, is_published: true },
  { id: "a2", slug: "abol-jiv", name: "Abol Jiv Ashram",
    short_description: "The foundation's animal and bird care initiative. Details will be published by the foundation.",
    long_description: "Abol Jiv Ashram is the foundation's animal and bird care initiative. Verified details about services will be published by the administrator.",
    image: "/images/abol-jiv.jpg", details_published: false, address: null, map_url: null, contact_phone: null, services: null, sort_order: 2, is_published: true },
  { id: "a3", slug: "community-seva", name: "Community Seva Ashram",
    short_description: "Our third ashram. Its name, location and services will be announced soon.",
    long_description: "This page is a temporary placeholder. The actual name, location, mission and services will be supplied by the foundation.",
    image: "/images/community-seva.jpg", details_published: false, address: null, map_url: null, contact_phone: null, services: null, sort_order: 3, is_published: true },
];

export const defaultCampaigns: Campaign[] = [
  { id: "c1", slug: "senior-citizens", title: "Food and Care for Senior Citizens", description: "Help provide nourishing meals, companionship and everyday care to senior citizens.", image: "/images/campaign-1.jpg", cta_label: "Support Senior Care", donate_purpose: "Senior Citizen Care", sort_order: 1, is_published: true },
  { id: "c2", slug: "animals-birds", title: "Compassion for Animals and Birds", description: "Support the care, protection and well-being of animals and birds in need.", image: "/images/animal-care-1.jpg", cta_label: "Support Animal Care", donate_purpose: "Animal and Bird Care", sort_order: 2, is_published: true },
  { id: "c3", slug: "community-welfare", title: "Community Welfare", description: "Strengthen a community built on compassion, care and shared responsibility.", image: "/images/campaign-2.jpg", cta_label: "Make a Difference", donate_purpose: "Community Seva", sort_order: 3, is_published: true },
];

export const defaultSettings: Settings = {
  about: {
    headline: "Every Life Deserves Care, Respect and Love.",
    body: "At 7 Star Help Foundation, we believe that kindness is more than an act. It is a commitment to care for those who need support, to respect every life, and to build a more compassionate community.",
    long: "The foundation's full story, vision and mission will be added here by the administrator.",
  },
  contact: { whatsapp_display: "+91 70708 18112", whatsapp_number: "917070818112", email: "", address: "" },
  social: { instagram: "", facebook: "", youtube: "", threads: "" },
  footer: { intro: "7 Star Help Foundation serves senior citizens, animals and birds, and the wider community with care, dignity and compassion." },
  csr: {
    headline: "Together, We Can Create a Greater Impact.",
    body: "We welcome conversations with companies and individuals who would like to collaborate or volunteer with the foundation. Please share your details and our team will get in touch to discuss how we can work together.",
  },
  seo: {
    title: "7 Star Help Foundation | Care, Compassion and Annadan Seva",
    description: "7 Star Help Foundation cares for senior citizens, animals and birds, and the community. Support Annadan Seva and make kindness go further.",
  },
};
