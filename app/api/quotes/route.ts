import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  if (!body.name || !body.phone || !body.email || !body.city || !body.service || !body.message) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  if (!process.env.DATABASE_URL) return NextResponse.json({ ok: true, mode: "demo" }, { status: 201 });
  try {
    await sql`INSERT INTO quote_requests (name, company, phone, email, city, service_name, message, status)
      VALUES (${String(body.name)}, ${body.company ? String(body.company) : null}, ${String(body.phone)}, ${String(body.email)}, ${String(body.city)}, ${String(body.service)}, ${String(body.message)}, 'new')`;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "No fue posible guardar la solicitud" }, { status: 500 }); }
}
