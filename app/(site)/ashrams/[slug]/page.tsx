import Link from "next/link";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import SafeImage from "@/components/SafeImage";
import { getAshram } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const a = await getAshram(params.slug);
  return { title: a?.name ?? "Ashram" };
}

export default async function AshramPage({ params }: { params: { slug: string } }) {
  const a = await getAshram(params.slug);
  if (!a) notFound();
  const showDetails = a.details_published;
  return (
    <>
      <PageHero eyebrow="Our Ashrams" title={a.name} subtitle={a.short_description} />
      <section className="py-16 sm:py-24">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <div className="gold-frame overflow-hidden rounded-3xl shadow-photo">
            <SafeImage src={a.image} alt={a.name} className="aspect-[4/3] w-full" />
          </div>
          <div className="space-y-6">
            <p className="whitespace-pre-line text-lg leading-relaxed text-body/85">{a.long_description}</p>
            {showDetails && a.services && (
              <div><h2 className="text-2xl font-semibold text-navy">Services</h2><p className="mt-2 whitespace-pre-line text-body/85">{a.services}</p></div>
            )}
            {showDetails && a.address && (
              <div><h2 className="text-2xl font-semibold text-navy">Address</h2><p className="mt-2 whitespace-pre-line text-body/85">{a.address}</p></div>
            )}
            {showDetails && a.contact_phone && <p className="text-body/85">Phone: {a.contact_phone}</p>}
            {showDetails && a.map_url && /^https:\/\//.test(a.map_url) && (
              <a href={a.map_url} target="_blank" rel="noopener noreferrer" className="btn-outline">Open in Maps</a>
            )}
            <div className="flex flex-wrap gap-3">
              <Link href="/donate" className="btn-primary">Donate Now</Link>
              {a.slug === "dikra-nu-ghar" && <Link href="/annadan-seva" className="btn-navy">View Daily Meal Donors</Link>}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
