"use client";
import CrudManager from "@/components/admin/CrudManager";

export default function Page() {
  return (
    <CrudManager table="campaigns" title="Campaigns" titleKey="title" subtitleKey="slug"
      intro="Add or edit campaigns. Do not enter fundraising totals unless they are verified."
      defaults={{ slug: "", title: "", description: "", image: "/images/campaign-1.jpg", cta_label: "Support This Cause", donate_purpose: "General Donation", sort_order: 10, is_published: false }}
      fields={[
        { key: "title", label: "Title", required: true },
        { key: "slug", label: "URL slug (lowercase, no spaces)", required: true },
        { key: "description", label: "Description", type: "textarea" },
        { key: "image", label: "Photo path or URL", type: "image" },
        { key: "cta_label", label: "Button text" },
        { key: "donate_purpose", label: "Donation purpose", type: "select", options: ["General Donation", "Senior Citizen Care", "Morning Meal Seva", "Evening Meal Seva", "Animal and Bird Care", "Community Seva", "Specific Campaign"] },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_published", label: "Published", type: "checkbox" },
      ]} />
  );
}
