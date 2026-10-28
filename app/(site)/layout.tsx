import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getAshrams, getCampaigns, getSettings } from "@/lib/content";

export const dynamic = "revalidate = 60";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [ashrams, campaigns, settings] = await Promise.all([getAshrams(), getCampaigns(), getSettings()]);
  return (
    <>
      <Header
        ashrams={ashrams.map((a) => ({ label: a.name, href: `/ashrams/${a.slug}` }))}
        campaigns={campaigns.map((c) => ({ label: c.title, href: `/campaigns#${c.slug}` }))}
      />
      <main>{children}</main>
      <Footer settings={settings} ashrams={ashrams} campaigns={campaigns} />
    </>
  );
}
