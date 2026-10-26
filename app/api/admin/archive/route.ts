import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { runArchive } from "@/lib/archive";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function isAdmin() {
  const supabase = createServerSupabase();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return false;
  const { data: row } = await supabase.from("admin_users").select("user_id").eq("user_id", data.user.id).maybeSingle();
  return !!row;
}

// Manual archive from the admin panel.
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  const r = await runArchive("manual");
  return NextResponse.json({ message: r.message }, { status: r.ok ? 200 : 500 });
}

// Scheduled run (Vercel Cron sends: Authorization: Bearer <CRON_SECRET>).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorised." }, { status: 401 });
  }
  const r = await runArchive("cron");
  return NextResponse.json({ message: r.message }, { status: r.ok ? 200 : 500 });
}
