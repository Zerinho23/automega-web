import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-session";
import { sql } from "@/lib/neon";
import { createSalt, hashPassword } from "@/lib/password";
import { readObject } from "@/lib/request-security";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await isAdminSession(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!sql) return NextResponse.json({ error: "La base de datos no está configurada" }, { status: 503 });
  let password: unknown;
  try { ({ password } = await readObject(request, 2000)); } catch { return NextResponse.json({error:'Datos inválidos'},{status:400}); }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) return NextResponse.json({ error: "La contraseña debe tener entre 8 y 128 caracteres" }, { status: 400 });
  const email = process.env.ADMIN_EMAIL;
  if (!email) return NextResponse.json({ error: "El correo administrador no está configurado" }, { status: 503 });
  const salt = createSalt();
  const passwordHash = await hashPassword(password, salt);
  try { await sql`INSERT INTO admin_credentials (email,password_hash,salt,updated_at) VALUES (${email},${passwordHash},${salt},now()) ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,salt=EXCLUDED.salt,updated_at=now()`; }
  catch { return NextResponse.json({error:'No fue posible actualizar la contraseña. Inténtalo nuevamente.'},{status:503}); }
  return NextResponse.json({ ok: true });
}
