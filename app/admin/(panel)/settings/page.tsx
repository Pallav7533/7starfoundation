"use client";
import SettingsEditor from "@/components/admin/SettingsEditor";

const groups = [
  { settingKey: "contact" as const, title: "Contact Details", fields: [
    { key: "whatsapp_display", label: "Phone shown on website", help: "e.g. +91 70708 18112" },
    { key: "whatsapp_number", label: "WhatsApp number for donations (digits only, with 91)", help: "917070818112" },
    { key: "email", label: "Public email (optional)" }, { key: "address", label: "Public address (optional)", textarea: true }] },
];
export default function Page() {
  return (
    <div className="space-y-10">
      <SettingsEditor title="Settings" intro="Contact details used in the footer, contact page and donation WhatsApp link." groups={groups} />
      <section className="card p-6 text-sm text-body/80">
        <h2 className="text-2xl font-semibold text-navy">Admin password</h2>
        <p className="mt-2">To change the administrator password, sign out, choose <strong>Forgot password?</strong> on the login page and follow the e-mailed link. You can also reset it in the Supabase dashboard under Authentication → Users.</p>
      </section>
    </div>
  );
}
