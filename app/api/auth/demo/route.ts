import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };
  if (email !== "admin@automega.cl" || password !== "demo1234") return NextResponse.json({ error: "Credenciales incorrectas" }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set("automega_demo_admin", "active", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("automega_demo_admin");
  return response;
}
