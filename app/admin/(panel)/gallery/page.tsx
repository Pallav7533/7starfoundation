"use client";
import CrudManager from "@/components/admin/CrudManager";

export default function Page() {
  return (
    <CrudManager table="gallery_items" title="Gallery and Videos" titleKey="title" subtitleKey="category"
      intro="Paste an image path/URL, or a YouTube / Vimeo / direct .mp4 link for videos. Videos never autoplay."
      defaults={{ title: "", category: "Community Service", media_type: "image", url: "", thumbnail: "", sort_order: 10, is_published: true }}
      fields={[
        { key: "title", label: "Title / caption" },
        { key: "category", label: "Category", type: "select", options: ["Senior Citizen Care", "Annadan Seva", "Animal and Bird Care", "Community Service", "Events and Activities"] },
        { key: "media_type", label: "Type", type: "select", options: ["image", "video"] },
        { key: "url", label: "Image path or video URL", type: "image", required: true },
        { key: "thumbnail", label: "Video thumbnail (optional image)", type: "image", nullable: true },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_published", label: "Published", type: "checkbox" },
      ]} />
  );
}
