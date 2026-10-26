import Link from "next/link";
import PageHero from "@/components/PageHero";
import AnnadanRegister from "@/components/AnnadanRegister";
import { getAshrams, todayIST } from "@/lib/content";

export const metadata = { title: "Annadan Seva — Daily Meal Donation Register" };
export const dynamic = "force-dynamic";

export default async function AnnadanSeva() {
  const ashrams = await getAshrams();
  return (
    <>
      <PageHero eyebrow="Annadan Seva" title="Annadan Seva — Daily Meal Donation Register"
        subtitle="Honouring the kindness of individuals and families who support meals for the senior citizens at Dikra Nu Ghar Ashram." />
      <section className="py-12 sm:py-16">
        <div className="container-x">
          <AnnadanRegister today={todayIST()} ashrams={ashrams.map((a) => ({ slug: a.slug, name: a.name }))} />
          <div className="mt-12 rounded-3xl bg-navy p-8 text-center text-white sm:p-12">
            <h2 className="text-3xl font-semibold sm:text-4xl">Share a Meal. Share a Moment of Happiness.</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Sponsor a morning or evening meal for the senior citizens, on a birthday, an anniversary, or in loving memory.</p>
            <Link href="/donate?purpose=Morning%20Meal%20Seva" className="btn-gold mt-6">Support Annadan Seva</Link>
          </div>
        </div>
      </section>
    </>
  );
}
