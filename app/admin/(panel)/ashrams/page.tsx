"use client";
import CrudManager from "@/components/admin/CrudManager";

export default function Page() {
  return (
    <CrudManager table="ashrams" title="Ashram Details" titleKey="name" subtitleKey="slug" canCreate={false} canDelete={false}
      intro="Edit the three ashram pages. Address, services, phone and map stay hidden from visitors until you tick Show Detailed Information."
      defaults={{}}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "short_description", label: "Short description (cards)", type: "textarea" },
        { key: "long_description", label: "Full description (detail page)", type: "textarea" },
        { key: "image", label: "Photo path or URL", type: "image", help: "e.g. /images/dikra-nu-ghar.jpg" },
        { key: "address", label: "Address", type: "textarea", nullable: true },
        { key: "contact_phone", label: "Ashram phone", nullable: true },
        { key: "map_url", label: "Google Maps link (https://)", nullable: true },
        { key: "services", label: "Services", type: "textarea", nullable: true },
        { key: "details_published", label: "Show detailed information publicly (address, services, phone, map)", type: "checkbox" },
        { key: "sort_order", label: "Order", type: "number" },
        { key: "is_published", label: "Published", type: "checkbox" },
      ]} />
  );
}
