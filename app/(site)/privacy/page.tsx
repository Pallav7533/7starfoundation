import PageHero from "@/components/PageHero";

export const metadata = { title: "Privacy Policy" };

export default function Page() {
  return (
    <>
      <PageHero title="Privacy Policy" />
      <section className="container-x max-w-3xl space-y-4 py-14 text-body/85">
        <p className="rounded-xl bg-gold/15 p-4 text-sm">This is a starter text. Please have the foundation's final Privacy Policy reviewed and replaced before launch.</p>
        <p>We collect only the details you submit through our forms (such as name, mobile number and message) so that the foundation can respond to you. Donor phone numbers, addresses and private notes entered by the foundation are never shown publicly. Donor names and occasions are published on the Annadan Seva register only when public display permission has been recorded.</p><p>We never ask for UPI PINs, passwords or card credentials. Opening WhatsApp from the donation form only sends an enquiry; it does not confirm that a payment has been made or received.</p>
      </section>
    </>
  );
}
