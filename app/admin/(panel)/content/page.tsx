"use client";
import SettingsEditor from "@/components/admin/SettingsEditor";

const groups = [
  { settingKey: "about" as const, title: "About Us", fields: [
    { key: "headline", label: "Headline" }, { key: "body", label: "Short introduction (homepage)", textarea: true }, { key: "long", label: "Full About Us text", textarea: true }] },
  { settingKey: "csr" as const, title: "CSR Section", fields: [{ key: "headline", label: "Headline" }, { key: "body", label: "Text", textarea: true }] },
  { settingKey: "footer" as const, title: "Footer", fields: [{ key: "intro", label: "Footer introduction", textarea: true }] },
  { settingKey: "seo" as const, title: "SEO", fields: [{ key: "title", label: "Browser/search title" }, { key: "description", label: "Search description", textarea: true }] },
];
export default function Page() {
  return <SettingsEditor title="Website Content" intro="Edit text across the website. Changes appear immediately." groups={groups} />;
}
