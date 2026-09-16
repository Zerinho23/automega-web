import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";
import { allowRequest, sameOrigin, readObject } from '@/lib/request-security';
import { notifyQuote } from '@/lib/quote-notifications';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Origen no permitido'}, {status:403});
  let body: Record<string, unknown>;
  try { body = await readObject(request); } catch { return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 }); }
  if (["name", "phone", "email", "city", "service", "message"].some((key) => typeof body[key] !== "string" || !String(body[key]).trim())) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }
  if (!sql) return NextResponse.json({ error: "La base de datos no está configurada" }, { status: 503 });
  const phoneDigits = String(body.phone).replace(/\D/g, '');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim()) || String(body.email).length > 254 || !/^[+\d\s()-]{8,22}$/.test(String(body.phone)) || phoneDigits.length < 8 || phoneDigits.length > 15 || String(body.message).length > 4000 || ['name','city','service','company'].some(key=>String(body[key] || '').length > 200)) return NextResponse.json({error:'Revisa el correo y escribe un teléfono válido de 8 a 15 dígitos. El mensaje admite hasta 4000 caracteres.'}, {status:400});
  try {
    if (!(await allowRequest(request,'quotes',5,15))) return NextResponse.json({error:'Demasiados envíos. Intenta nuevamente en 15 minutos.'},{status:429});
    const rows = await sql`INSERT INTO quote_requests (name, company, phone, email, city, service_name, message, status)
      VALUES (${String(body.name).trim()}, ${body.company ? String(body.company).trim() : null}, ${String(body.phone)}, ${String(body.email).trim().toLowerCase()}, ${String(body.city)}, ${String(body.service)}, ${String(body.message)}, 'new') RETURNING id,name,email,service_name,city,message`;
    await notifyQuote(rows[0] as any).catch(()=>{});
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch { return NextResponse.json({ error: "No fue posible guardar la solicitud. Verifica la conexión con Neon." }, { status: 500 }); }
}
