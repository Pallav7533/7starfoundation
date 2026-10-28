import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "revalidate = 60";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin");
  const { data: row } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!row) redirect("/admin");
  return <AdminShell email={data.user.email ?? ""}>{children}</AdminShell>;
}
