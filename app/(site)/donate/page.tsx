import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import DonateForm from "@/components/DonateForm";
import { getAshrams, getCampaigns, getSettings } from "@/lib/content";

export const metadata = { title: "Donate Now" };
export const dynamic = "force-dynamic";

export default async function Donate() {
  const [ashrams, campaigns, settings] = await Promise.all([getAshrams(), getCampaigns(), getSettings()]);
  const targets = [...ashrams.map((a) => a.name), ...campaigns.map((c) => c.title)];
  return (
    <>
      <PageHero eyebrow="Donate Now" title="Be the Reason Someone Feels Cared For." subtitle="Fill in the details and continue on WhatsApp. The foundation team will guide you through the donation process." />
      <section className="py-14 sm:py-20">
        <div className="container-x max-w-3xl">
          <Suspense fallback={<div className="card h-96 animate-pulse" />}>
            <DonateForm targets={targets} whatsappNumber={settings.contact.whatsapp_number || "917070818112"} />
          </Suspense>
        </div>
      </section>
    </>
  );
}
