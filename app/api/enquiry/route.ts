import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
const clean = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (!rateLimit(`enq:${ip}`, 5, 10 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many messages. Please try again in a few minutes." }, { status: 429 });
  }
  let body: any;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request." }, { status: 400 }); }
  if (body?.website) return NextResponse.json({ ok: true }); // honeypot

  const email = clean(body.email, 160);
  const phone = clean(body.phone, 20);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (phone && !/^[0-9+\-\s]{7,20}$/.test(phone)) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });

  try {
    const db = createServiceClient();
    if (body.kind === "csr") {
      const company = clean(body.company, 160), contact = clean(body.contact_person, 120);
      if (!company || !contact || !phone) return NextResponse.json({ error: "Please fill in company, contact person and mobile number." }, { status: 400 });
      const { error } = await db.from("csr_enquiries").insert({
        company, contact_person: contact, phone, email: email || null,
        interest: clean(body.interest, 80), message: clean(body.message, 2000),
      });
      if (error) throw error;
    } else {
      const name = clean(body.name, 120), message = clean(body.message, 2000);
      if (!name || !message) return NextResponse.json({ error: "Please enter your name and message." }, { status: 400 });
      const { error } = await db.from("contact_enquiries").insert({ name, phone: phone || null, email: email || null, message });
      if (error) throw error;
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "We could not send your message right now. Please try WhatsApp instead." }, { status: 500 });
  }
}
