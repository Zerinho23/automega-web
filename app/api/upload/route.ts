import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";
import { isAdminSession } from "@/lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!(await isAdminSession(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const form = await request.formData();
  const file = form.get("file");
  const target = String(form.get("target") || "gallery");
  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió la imagen" }, { status: 400 });
  if (!/^image\/(png|jpe?g|webp)$/i.test(file.type)) return NextResponse.json({ error: "Formato no permitido. Usa PNG, JPG o WebP." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "La imagen supera los 4 MB permitidos" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  if (!sql) return NextResponse.json({ error: "La base de datos no está configurada" }, { status: 503 });
  try {
    if (["hero", "logo", "about"].includes(target)) {
      const key = target === "hero" ? "hero_image" : target === "logo" ? "logo_url" : "about_image";
      await sql`INSERT INTO site_settings (key,value) VALUES (${key},${publicUrl}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`;
    } else if (target.startsWith("project:")) {
      const projectId = target.slice("project:".length);
      if (!projectId || projectId.startsWith("draft-")) return NextResponse.json({ error: "Guarda el proyecto antes de cargar su imagen" }, { status: 400 });
      if (/^[0-9a-f-]{36}$/i.test(projectId)) await sql`UPDATE projects SET image_url=${publicUrl} WHERE id=${projectId}`;
      else await sql`INSERT INTO site_settings (key,value) VALUES (${`project_image_${projectId}`},${publicUrl}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
    } else {
      await sql`INSERT INTO site_images (file_name,public_url,alt_text,section) VALUES (${file.name},${publicUrl},${file.name},${target})`;
    }
    return NextResponse.json({ ok: true, publicUrl });
  } catch { return NextResponse.json({ error: "No fue posible guardar la imagen en Neon" }, { status: 500 }); }
}
