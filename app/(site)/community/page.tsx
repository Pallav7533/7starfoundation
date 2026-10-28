import Link from "next/link";
import PageHero from "@/components/PageHero";
import SafeImage from "@/components/SafeImage";
import { getSettings } from "@/lib/content";

export const metadata = { title: "Community" };
export const dynamic = "revalidate = 60";

export default async function Community() {
  const s = await getSettings();
  const links = Object.entries(s.social).filter(([, v]) => /^https?:\/\//.test(v || ""));
  return (
    <>
      <PageHero eyebrow="Community" title="Together, We Can Make Kindness Go Further." subtitle="Every contribution can help strengthen a community built on compassion, care, and shared responsibility." />
      <section className="py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div className="gold-frame overflow-hidden rounded-3xl shadow-photo"><SafeImage src="/images/community-seva.jpg" alt="Community seva" className="aspect-[4/3] w-full" /></div>
          <div className="space-y-5">
            <h2 className="text-3xl font-semibold text-navy sm:text-4xl">Join the Seva</h2>
            <p className="text-lg text-body/85">Volunteer, share a meal, or simply spread the word. Reach out to the foundation and we will guide you on how you can take part.</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="btn-primary">Get Involved</Link>
              <Link href="/donate" className="btn-outline">Donate Now</Link>
            </div>
            <div className="pt-4">
              <p className="eyebrow">Follow Us</p>
              {links.length ? (
                <ul className="mt-3 flex flex-wrap gap-3">
                  {links.map(([k, v]) => (
                    <li key={k}><a className="btn-outline capitalize" href={v} target="_blank" rel="noopener noreferrer">{k}</a></li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-body/60">Our social media links will appear here soon.</p>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
