import { NextResponse } from "next/server";
import { createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return NextResponse.json({ error: "Configura ADMIN_EMAIL y ADMIN_PASSWORD en .env.local" }, { status: 503 });
  if (email !== adminEmail || password !== adminPassword) return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("automega_admin_session", await createAdminSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("automega_admin_session");
  return response;
}
