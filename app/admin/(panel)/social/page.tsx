"use client";
import SettingsEditor from "@/components/admin/SettingsEditor";

const groups = [
  { settingKey: "social" as const, title: "Social Media Links", fields: [
    { key: "instagram", label: "Instagram URL", url: true }, { key: "facebook", label: "Facebook URL", url: true },
    { key: "youtube", label: "YouTube URL", url: true }, { key: "threads", label: "Threads URL", url: true }] },
];
export default function Page() {
  return <SettingsEditor title="Social Media Links" intro="Paste the official profile links (https://…). Empty links stay hidden on the website." groups={groups} />;
}
