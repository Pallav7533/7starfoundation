import PageHero from "@/components/PageHero";
import EnquiryForm from "@/components/EnquiryForm";
import { getSettings } from "@/lib/content";

export const metadata = { title: "CSR and Partnerships" };
export const dynamic = "revalidate = 60";

export default async function CSR() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="CSR and Volunteering" title={s.csr.headline} />
      <section className="py-16 sm:py-24">
        <div className="container-x grid items-start gap-12 lg:grid-cols-2">
          <div className="space-y-5 text-lg leading-relaxed text-body/85">
            <p>{s.csr.body}</p>
            <p className="text-base text-body/70">Please share your details and the foundation will respond to discuss the available options.</p>
          </div>
          <EnquiryForm kind="csr" />
        </div>
      </section>
    </>
  );
}
