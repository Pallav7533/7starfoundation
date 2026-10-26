import PageHero from "@/components/PageHero";
import GalleryGrid from "@/components/GalleryGrid";
import { getGallery } from "@/lib/content";

export const metadata = { title: "Gallery" };
export const dynamic = "force-dynamic";

export default async function Gallery() {
  const items = await getGallery();
  return (
    <>
      <PageHero eyebrow="Gallery" title="Stories of Service" subtitle="Photographs and videos from the foundation's work." />
      <div className="container-x py-14 sm:py-20">
        {items.length === 0
          ? <p className="rounded-2xl border border-dashed border-gold/60 p-10 text-center text-body/70">Gallery items will be added soon.</p>
          : <GalleryGrid items={items} />}
      </div>
    </>
  );
}
