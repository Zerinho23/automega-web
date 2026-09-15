import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { sql } from "@/lib/neon";
import { createSalt, hashPassword } from "@/lib/password";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminSession(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "La base de datos no está configurada" }, { status: 503 });
  const { password } = await request.json() as { password?: string };
  if (!password || password.length < 8 || password.length > 128) return NextResponse.json({ error: "La contraseña debe tener entre 8 y 128 caracteres" }, { status: 400 });
  const email = process.env.ADMIN_EMAIL;
  if (!email) return NextResponse.json({ error: "El correo administrador no está configurado" }, { status: 503 });
  const salt = createSalt();
  const passwordHash = await hashPassword(password, salt);
  await sql`INSERT INTO admin_credentials (email,password_hash,salt,updated_at) VALUES (${email},${passwordHash},${salt},now()) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,salt=EXCLUDED.salt,updated_at=now()`;
  return NextResponse.json({ ok: true });
}
