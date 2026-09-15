import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";
import { sql } from "@/lib/neon";
import { verifyPassword } from "@/lib/password";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return NextResponse.json({ error: "Configura ADMIN_EMAIL y ADMIN_PASSWORD en .env.local" }, { status: 503 });
  let valid = email === adminEmail && password === adminPassword;
  if (sql && email === adminEmail && password) {
    try {
      const credentials = await sql`SELECT password_hash,salt FROM admin_credentials WHERE email=${adminEmail} LIMIT 1`;
      if (credentials.length) valid = await verifyPassword(password, String(credentials[0].salt), String(credentials[0].password_hash));
    } catch { /* Mantiene la credencial de entorno durante la primera migración. */ }
  }
  if (!valid) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("automega_admin_session", await createAdminSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("automega_admin_session");
  return response;
}
