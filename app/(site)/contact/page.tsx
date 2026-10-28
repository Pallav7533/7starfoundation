import PageHero from "@/components/PageHero";
import EnquiryForm from "@/components/EnquiryForm";
import { getSettings } from "@/lib/content";

export const metadata = { title: "Contact Us" };
export const dynamic = "revalidate = 60";

export default async function Contact() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="Contact Us" title="We Would Love to Hear From You" />
      <section className="py-16 sm:py-24">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <p className="text-lg text-body/85">Write to us or message the foundation directly on WhatsApp.</p>
            <a href={`https://wa.me/${s.contact.whatsapp_number}`} className="btn-primary" target="_blank" rel="noopener noreferrer">WhatsApp {s.contact.whatsapp_display}</a>
            {s.contact.email && <p>Email: <a className="font-semibold text-magenta" href={`mailto:${s.contact.email}`}>{s.contact.email}</a></p>}
            {s.contact.address && <p className="whitespace-pre-line">{s.contact.address}</p>}
          </div>
          <EnquiryForm kind="contact" />
        </div>
      </section>
    </>
  );
}
