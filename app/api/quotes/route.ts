import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
  if (["name", "phone", "email", "city", "service", "message"].some((key) => typeof body[key] !== "string" || !String(body[key]).trim())) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  if (!sql) return NextResponse.json({ error: "La base de datos no está configurada" }, { status: 503 });
  try {
    await sql`INSERT INTO quote_requests (name, company, phone, email, city, service_name, message, status)
      VALUES (${String(body.name)}, ${body.company ? String(body.company) : null}, ${String(body.phone)}, ${String(body.email)}, ${String(body.city)}, ${String(body.service)}, ${String(body.message)}, 'new')`;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "No fue posible guardar la solicitud. Verifica la conexión con Neon." }, { status: 500 }); }
}
