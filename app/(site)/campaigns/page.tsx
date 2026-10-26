import Link from "next/link";
import PageHero from "@/components/PageHero";
import SafeImage from "@/components/SafeImage";
import { getCampaigns } from "@/lib/content";

export const metadata = { title: "Our Campaigns" };
export const dynamic = "force-dynamic";

export default async function Campaigns() {
  const campaigns = await getCampaigns();
  return (
    <>
      <PageHero eyebrow="Our Campaigns" title="Ways to Make a Difference" subtitle="Choose the cause closest to your heart." />
      <div className="container-x space-y-16 py-16 sm:py-24">
        {campaigns.map((c, i) => (
          <article id={c.slug} key={c.id} className={`grid scroll-mt-28 items-center gap-10 lg:grid-cols-2 ${i % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
            <div className="gold-frame overflow-hidden rounded-3xl shadow-photo">
              <SafeImage src={c.image} alt={c.title} className="aspect-[4/3] w-full" />
            </div>
            <div>
              <h2 className="text-3xl font-semibold text-navy sm:text-4xl">{c.title}</h2>
              <p className="mt-4 text-lg text-body/85">{c.description}</p>
              <Link href={`/donate?purpose=${encodeURIComponent(c.donate_purpose)}`} className="btn-primary mt-6">{c.cta_label}</Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
