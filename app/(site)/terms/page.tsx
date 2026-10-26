import PageHero from "@/components/PageHero";

export const metadata = { title: "Terms and Conditions" };

export default function Page() {
  return (
    <>
      <PageHero title="Terms and Conditions" />
      <section className="container-x max-w-3xl space-y-4 py-14 text-body/85">
        <p className="rounded-xl bg-gold/15 p-4 text-sm">This is a starter text. Please have the foundation's final Terms and Conditions reviewed and replaced before launch.</p>
        <p>By using this website you agree to use it lawfully and respectfully. Information on this site is provided for general information about the foundation&apos;s work.</p><p>Submitting the donation form opens a WhatsApp enquiry to the foundation. It is not a payment and is not a confirmation that a donation has been received. The foundation will guide you on the donation process.</p>
      </section>
    </>
  );
}
