import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerSupabase();
  // Both checks run at the SAME time (one round-trip instead of two in a row).
  // getUser() verifies the login with Supabase; is_admin() is checked by the database itself.
  const [{ data }, { data: isAdmin }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.rpc("is_admin"),
  ]);
  if (!data.user || isAdmin !== true) redirect("/admin");
  return <AdminShell email={data.user.email ?? ""}>{children}</AdminShell>;
}
