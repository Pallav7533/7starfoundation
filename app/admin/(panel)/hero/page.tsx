"use client";
import CrudManager from "@/components/admin/CrudManager";

export default function Page() {
  return (
    <CrudManager table="hero_slides" title="Hero Slides" titleKey="headline" subtitleKey="eyebrow"
      intro="The four homepage slides: text, photos, buttons and order. Lower order number shows first."
      defaults={{ sort_order: 10, eyebrow: "", headline: "", body: "", image: "/images/1.jpg", detail_image: "", object_position: "center", primary_label: "Donate Now", primary_href: "/donate", secondary_label: "", secondary_href: "", is_published: true }}
      fields={[
        { key: "eyebrow", label: "Small label above headline" },
        { key: "headline", label: "Headline", required: true },
        { key: "body", label: "Supporting text", type: "textarea" },
        { key: "image", label: "Main photo path", type: "image", required: true, help: "Default files: /images/1.jpg to /images/4.jpg" },
        { key: "detail_image", label: "Small overlapping photo path", type: "image", nullable: true },
        { key: "object_position", label: "Photo focus (CSS, e.g. center 20%)" },
        { key: "primary_label", label: "Main button text" },
        { key: "primary_href", label: "Main button link (/donate)" },
        { key: "secondary_label", label: "Second button text", nullable: true },
        { key: "secondary_href", label: "Second button link", nullable: true },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_published", label: "Published", type: "checkbox" },
      ]} />
  );
}
