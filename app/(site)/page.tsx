import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import SafeImage from "@/components/SafeImage";
import DonorPanel from "@/components/DonorPanel";
import GalleryGrid from "@/components/GalleryGrid";
import EnquiryForm from "@/components/EnquiryForm";
import { getAshrams, getCampaigns, getGallery, getHeroSlides, getPublishedDonors, getSettings, todayIST } from "@/lib/content";
import type { GalleryItem } from "@/lib/types";

export const dynamic = "revalidate = 60";

const fallbackGallery: GalleryItem[] = [1, 2, 3, 4].map((n, i) => ({
  id: `g${n}`, title: "", media_type: "image", url: `/images/gallery-${n}.jpg`, thumbnail: null, sort_order: n, is_published: true,
  category: ["Senior Citizen Care", "Annadan Seva", "Animal and Bird Care", "Community Service"][i],
}));

export default async function Home() {
  const today = todayIST();
  const [slides, settings, ashrams, campaigns, gallery, donors] = await Promise.all([
    getHeroSlides(), getSettings(), getAshrams(), getCampaigns(), getGallery(),
    getPublishedDonors({ date: today, ashramSlug: "dikra-nu-ghar" }),
  ]);
  const morning = donors.filter((d) => d.meal_session === "morning");
  const evening = donors.filter((d) => d.meal_session === "evening");
  const galleryItems = (gallery.length ? gallery : fallbackGallery).slice(0, 9);

  return (
    <>
      {/* A: hero */}
      <HeroSlider slides={slides} />

      {/* B: emotional introduction */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <div className="gold-frame relative ml-auto aspect-[4/5] w-[86%] overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-photo">
              <SafeImage src="/images/foundation-about.jpg" alt="Care at 7 Star Help Foundation" className="h-full w-full" />
            </div>
            <div className="absolute -bottom-8 left-0 hidden w-[44%] overflow-hidden rounded-3xl border-4 border-cream shadow-photo sm:block">
              <SafeImage src="/images/senior-care-1.jpg" alt="" className="aspect-square w-full" />
            </div>
          </div>
          <div className="lg:col-span-6 lg:pl-8">
            <p className="eyebrow flex items-center gap-3"><span className="gold-rule" />Who We Are</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight text-navy sm:text-5xl">{settings.about.headline}</h2>
            <p className="mt-6 text-lg leading-relaxed text-body/85">{settings.about.body}</p>
            <Link href="/about" className="btn-navy mt-8">Learn About Our Foundation</Link>
          </div>
        </div>
      </section>

      {/* C: three pillars */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Our Pillars</p>
            <h2 className="mt-3 text-4xl font-semibold text-navy sm:text-5xl">Three Pillars of Compassion</h2>
            <div className="gold-rule mx-auto mt-5" />
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              { t: "Care for Senior Citizens", d: "Dignity, companionship and everyday care for elders who deserve to feel at home.", img: "/images/senior-care-1.jpg", href: "/ashrams/dikra-nu-ghar", r: "rounded-t-[200px] rounded-b-3xl" },
              { t: "Compassion for Animals and Birds", d: "Protection and well-being for the voiceless living beings around us.", img: "/images/animal-care-1.jpg", href: "/ashrams/abol-jiv", r: "rounded-3xl" },
              { t: "Community Seva", d: "Standing together as a community built on care and shared responsibility.", img: "/images/community-seva.jpg", href: "/community", r: "rounded-b-[200px] rounded-t-3xl" },
            ].map((p, k) => (
              <article key={p.t} className={`group ${k === 1 ? "md:mt-10" : ""}`}>
                <Link href={p.href} className="block">
                  <div className={`gold-frame overflow-hidden shadow-photo ${p.r}`}>
                    <SafeImage src={p.img} alt={p.t} className="aspect-[4/5] w-full transition duration-700 group-hover:scale-105" />
                  </div>
                </Link>
                <h3 className="mt-7 text-2xl font-semibold text-navy">{p.t}</h3>
                <p className="mt-2 text-body/80">{p.d}</p>
                <Link href={p.href} className="mt-3 inline-block text-sm font-semibold text-magenta hover:underline">Learn More →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* D: ashrams */}
      <section className="bg-navy py-20 text-white sm:py-28">
        <div className="container-x">
          <div className="max-w-2xl">
            <p className="eyebrow !text-gold-light">Our Homes of Seva</p>
            <h2 className="mt-3 text-4xl font-semibold sm:text-5xl">Our Three Ashrams</h2>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {ashrams.map((a) => (
              <article key={a.id} className="overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/15 transition hover:ring-gold">
                <Link href={`/ashrams/${a.slug}`}>
                  <SafeImage src={a.image} alt={a.name} className="aspect-[4/3] w-full" />
                </Link>
                <div className="p-7">
                  <h3 className="text-3xl font-semibold text-gold-light">{a.name}</h3>
                  <p className="mt-3 text-white/80">{a.short_description}</p>
                  <Link href={`/ashrams/${a.slug}`} className="btn-gold mt-6">View Ashram</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* E: Annadan Seva (live database) */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="container-x">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <p className="eyebrow flex items-center gap-3"><span className="gold-rule" />Annadan Seva</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight text-navy sm:text-5xl">Share a Meal. Share a Moment of Happiness.</h2>
              <p className="mt-5 text-body/85">Today&apos;s published meal donors at Dikra Nu Ghar Ashram. Thank you for every meal shared with love.</p>
              <div className="gold-frame relative mt-8 overflow-hidden rounded-[2.5rem] rounded-tr-[8rem] shadow-photo">
                <SafeImage src="/images/annadan-morning.jpg" alt="Annadan Seva" className="aspect-[4/3] w-full" />
              </div>
              <Link href="/annadan-seva" className="btn-primary mt-8">View All Annadan Seva</Link>
            </div>
            <div className="grid gap-6 lg:col-span-7 md:grid-cols-2">
              <DonorPanel session="morning" date={today} donors={morning} />
              <DonorPanel session="evening" date={today} donors={evening} dark />
            </div>
          </div>
        </div>
      </section>

      {/* F: campaigns */}
      <section className="bg-cream py-20 sm:py-28">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Our Campaigns</p>
              <h2 className="mt-3 text-4xl font-semibold text-navy sm:text-5xl">Ways to Make a Difference</h2>
            </div>
            <Link href="/campaigns" className="btn-outline">All Campaigns</Link>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {campaigns.map((c) => (
              <article key={c.id} className="card overflow-hidden">
                <SafeImage src={c.image} alt={c.title} className="aspect-[4/3] w-full" />
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-navy">{c.title}</h3>
                  <p className="mt-2 text-body/80">{c.description}</p>
                  <Link href={`/donate?purpose=${encodeURIComponent(c.donate_purpose)}`} className="btn-primary mt-5">{c.cta_label}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* G: stories of service */}
      <section className="py-20 sm:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-2xl text-center">
            <p className="eyebrow">Stories of Service</p>
            <h2 className="mt-3 text-4xl font-semibold text-navy sm:text-5xl">Moments of Kindness</h2>
            <div className="gold-rule mx-auto mt-5" />
          </div>
          <div className="mt-12"><GalleryGrid items={galleryItems} editorial showFilters={false} /></div>
          <div className="mt-10 text-center"><Link href="/gallery" className="btn-navy">Explore the Full Gallery</Link></div>
        </div>
      </section>

      {/* H: CSR */}
      <section className="bg-navy py-20 text-white sm:py-28">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <div>
            <p className="eyebrow !text-gold-light">Corporate Partnerships</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">{settings.csr.headline}</h2>
            <p className="mt-5 text-lg text-white/80">{settings.csr.body}</p>
            <Link href="/contact" className="btn-gold mt-8">Contact Us</Link>
          </div>
          <div className="text-body"><EnquiryForm kind="csr" /></div>
        </div>
      </section>

      {/* I: closing CTA */}
      <section className="relative isolate overflow-hidden py-28 text-center text-white sm:py-36">
        <SafeImage src="/images/closing-cta.jpg" alt="" className="absolute inset-0 -z-20 h-full w-full" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/80 via-navy/70 to-magenta/60" />
        <div className="container-x">
          <h2 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight sm:text-6xl">Be the Reason Someone Feels Cared For Today.</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/90">Your kindness can help bring dignity, care, and hope to those who need it most.</p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Link href="/donate" className="btn-gold px-8 py-4 text-base">Donate Now</Link>
            <Link href="/contact" className="btn border border-white/60 px-8 py-4 text-base text-white hover:bg-white hover:text-navy">Contact Our Foundation</Link>
          </div>
        </div>
      </section>
    </>
  );
}
