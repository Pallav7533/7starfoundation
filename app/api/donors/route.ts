import { NextResponse, type NextRequest } from "next/server";
import { getPublishedDonors } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const date = sp.get("date") ?? "";
  const ashram = sp.get("ashram") ?? "all";
  const session = sp.get("session") ?? "all";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Invalid date" }, { status: 400 });
  if (ashram !== "all" && !/^[a-z0-9-]{1,60}$/.test(ashram)) return NextResponse.json({ error: "Invalid ashram" }, { status: 400 });
  const donors = await getPublishedDonors({
    date, ashramSlug: ashram === "all" ? undefined : ashram, session,
  });
  // Only the view's public columns are ever selected, so private fields cannot appear here.
  return NextResponse.json({ donors }, { headers: { "Cache-Control": "no-store" } });
}
