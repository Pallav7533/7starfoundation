import { Suspense } from "react";
import PageHero from "@/components/PageHero";
import DonateForm from "@/components/DonateForm";
import { getAshrams, getCampaigns, getSettings } from "@/lib/content";

export const metadata = { title: "Donate Now" };
export const revalidate = 60; // cached page, refreshed every 60s

export default async function Donate() {
  const [ashrams, campaigns, settings] = await Promise.all([getAshrams(), getCampaigns(), getSettings()]);
  const targets = [...ashrams.map((a) => a.name), ...campaigns.map((c) => c.title)];
  return (
    <>
      <PageHero eyebrow="Donate Now" title="Be the Reason Someone Feels Cared For." subtitle="Choose an amount, scan the QR code with any UPI app, then share your details on WhatsApp so the foundation team can confirm your donation." />
      <section className="py-14 sm:py-20">
        <div className="container-x max-w-3xl">
          <Suspense fallback={<div className="card h-96 animate-pulse" />}>
            <DonateForm
              targets={targets}
              whatsappNumber={settings.contact.whatsapp_number || "917070818112"}
              upiId={process.env.UPI_ID || ""}
              payeeName={process.env.UPI_PAYEE_NAME || "7 Star Help Foundation"}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
