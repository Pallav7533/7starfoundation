import Link from "next/link";
import PageHero from "@/components/PageHero";
import SafeImage from "@/components/SafeImage";
import { getSettings } from "@/lib/content";

export const metadata = { title: "About Us" };
export const dynamic = "revalidate = 60";

export default async function About() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="About Us" title={s.about.headline} />
      <section className="py-16 sm:py-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div className="gold-frame overflow-hidden rounded-t-[999px] rounded-b-3xl shadow-photo">
            <SafeImage src="/images/foundation-about.jpg" alt="7 Star Help Foundation" className="aspect-[4/5] w-full" />
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-body/85">
            <p>{s.about.body}</p>
            <p className="whitespace-pre-line">{s.about.long}</p>
            <div className="flex flex-wrap gap-3 pt-3">
              <Link href="/donate" className="btn-primary">Donate Now</Link>
              <Link href="/contact" className="btn-outline">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
