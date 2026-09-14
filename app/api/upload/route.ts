import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get("file");
  const target = String(form.get("target") || "gallery");
  if (!(file instanceof File)) return NextResponse.json({ error: "No se recibió la imagen" }, { status: 400 });
  if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "La imagen supera los 8 MB" }, { status: 400 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const publicUrl = `data:${file.type};base64,${buffer.toString("base64")}`;
  if (!sql) return NextResponse.json({ ok: true, publicUrl, mode: "demo" });
  try {
    if (["hero", "logo", "about"].includes(target)) {
      const key = target === "hero" ? "hero_image" : target === "logo" ? "logo_url" : "about_image";
      await sql`INSERT INTO site_settings (key,value) VALUES (${key},${publicUrl}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()`;
    } else if (target.startsWith("project:")) {
      const projectId = target.slice("project:".length);
      if (!projectId || projectId.startsWith("draft-")) return NextResponse.json({ ok: true, publicUrl, mode: "demo" });
      if (/^[0-9a-f-]{36}$/i.test(projectId)) await sql`UPDATE projects SET image_url=${publicUrl} WHERE id=${projectId}`;
      else await sql`INSERT INTO site_settings (key,value) VALUES (${`project_image_${projectId}`},${publicUrl}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
    } else {
      await sql`INSERT INTO site_images (file_name,public_url,alt_text,section) VALUES (${file.name},${publicUrl},${file.name},${target})`;
    }
    return NextResponse.json({ ok: true, publicUrl });
  } catch { return NextResponse.json({ error: "No fue posible guardar la imagen en Neon" }, { status: 500 }); }
}
