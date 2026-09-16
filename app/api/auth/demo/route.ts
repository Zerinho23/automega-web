import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";
import { sql } from "@/lib/neon";
import { verifyPassword } from "@/lib/password";
import { allowRequest, sameOrigin, readObject } from '@/lib/request-security';

export async function POST(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Origen no permitido'},{status:403});
  let body: {email?:string;password?:string};
  try { body=await readObject(request, 2000) as typeof body; } catch { return NextResponse.json({error:'Datos inválidos'},{status:400}); }
  const { email, password } = body;
  if (typeof email !== 'string' || typeof password !== 'string' || password.length > 128) return NextResponse.json({error:'Datos inválidos'},{status:400});
  try { if (!(await allowRequest(request,'login',10,15))) return NextResponse.json({error:'Demasiados intentos. Espera 15 minutos.'},{status:429}); } catch { return NextResponse.json({error:'Acceso temporalmente no disponible'},{status:503}); }
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return NextResponse.json({ error: "Configura ADMIN_EMAIL y ADMIN_PASSWORD en .env.local" }, { status: 503 });
  let valid = email === adminEmail && password === adminPassword;
  if (sql && email === adminEmail && password) {
    try {
      const credentials = await sql`SELECT password_hash,salt FROM admin_credentials WHERE email=${adminEmail} LIMIT 1`;
      if (credentials.length) valid = await verifyPassword(password, String(credentials[0].salt), String(credentials[0].password_hash));
    } catch { return NextResponse.json({error:'Acceso temporalmente no disponible'},{status:503}); }
  }
  if (!valid) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("automega_admin_session", await createAdminSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return NextResponse.json({error:'Origen no permitido'},{status:403});
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("automega_admin_session");
  return response;
}
