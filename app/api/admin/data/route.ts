import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";
import { isAdminSession } from "@/lib/admin-session";
import { readObject } from "@/lib/request-security";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!(await isAdminSession(request))) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const section = new URL(request.url).searchParams.get("section") || "";
  if (!sql) return NextResponse.json({error:'La información no está disponible. Inténtalo nuevamente.'},{status:503});
  try {
    if (section === "quotes") {
      const items = await sql`SELECT id,name,company,phone,email,service_name,city,message,status,created_at,internal_notes,assigned_to,follow_up_at FROM quote_requests ORDER BY created_at DESC`;
      return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
    }
    if (section === "services") {
      const items = await sql`SELECT id,title,description,visible,sort_order FROM services ORDER BY sort_order`;
      return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
    }
    if (section === "projects") {
      const items = await sql`SELECT id,title,description,location,visible,sort_order,image_url FROM projects ORDER BY sort_order`;
      return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
    }
    if (section === "images") {
      const items = await sql`SELECT id,file_name,public_url,alt_text,visible,sort_order,created_at FROM site_images ORDER BY created_at DESC`;
      return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
    }
    const rows = await sql`SELECT key,value FROM site_settings`;
    return NextResponse.json({ settings: Object.fromEntries(rows.map((row: any) => [row.key, row.value])) }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "No fue posible consultar los datos" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await isAdminSession(request)) || !sql) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  let body: { section?: string; id?: string; status?: string; items?: any[]; settings?: Record<string, string>;notes?:string;owner?:string;date?:string };
  try { body = await readObject(request, 16_000_000) as typeof body; } catch { return NextResponse.json({error:'Datos inválidos'},{status:400}); }
  if (['services','projects'].includes(body.section || '') && (!Array.isArray(body.items) || body.items.length > 100 || body.items.some(item => !item || typeof item.id !== 'string' || typeof item.title !== 'string' || !item.title.trim() || item.title.length > 200 || typeof item.description !== 'string' || !item.description.trim() || item.description.length > 4000 || typeof item.visible !== 'boolean' || !Number.isFinite(Number(item.sort_order))))) return NextResponse.json({error:'Completa el título y la descripción de cada elemento antes de guardar.'},{status:400});
  try {
    if (body.section === 'quote_followup') {
      if (!body.id || typeof body.notes !== 'string' || body.notes.length > 4000 || typeof body.owner !== 'string' || body.owner.length > 120 || (body.date && !/^\d{4}-\d{2}-\d{2}$/.test(body.date))) return NextResponse.json({error:'Datos inválidos'},{status:400});
      await sql`UPDATE quote_requests SET internal_notes=${body.notes},assigned_to=${body.owner},follow_up_at=${body.date || null} WHERE id=${body.id}`;
      return NextResponse.json({ok:true});
    }
    if (body.section === "quotes") {
      if (!body.id || !["new", "reviewed", "contacted", "closed"].includes(body.status || "")) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
      await sql`UPDATE quote_requests SET status=${body.status} WHERE id=${body.id}`;
      return NextResponse.json({ ok: true });
    }
    if (body.section === "settings") {
      for (const [key, value] of Object.entries(body.settings || {})) {
        if (typeof value !== "string") continue;
        await sql`INSERT INTO site_settings (key,value,updated_at) VALUES (${key},${value},now()) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value,updated_at=now()`;
      }
      return NextResponse.json({ ok: true });
    }
    if (body.section === "services") {
      for (const item of body.items || []) {
        if (!item.title || !item.description) continue;
        if (String(item.id).startsWith("draft-")) await sql`INSERT INTO services (title,description,visible,sort_order) VALUES (${String(item.title)},${String(item.description)},${Boolean(item.visible)},${Number(item.sort_order) || 0})`;
        else await sql`UPDATE services SET title=${String(item.title)},description=${String(item.description)},visible=${Boolean(item.visible)},sort_order=${Number(item.sort_order) || 0} WHERE id=${item.id}`;
      }
      return NextResponse.json({ ok: true });
    }
    if (body.section === "projects") {
      for (const item of body.items || []) {
        if (!item.title || !item.description) continue;
        if (String(item.id).startsWith("draft-")) await sql`INSERT INTO projects (title,description,location,image_url,visible,sort_order) VALUES (${String(item.title)},${String(item.description)},${item.location ? String(item.location) : null},${item.image_url ? String(item.image_url) : null},${Boolean(item.visible)},${Number(item.sort_order) || 0})`;
        else await sql`UPDATE projects SET title=${String(item.title)},description=${String(item.description)},location=${item.location ? String(item.location) : null},image_url=${item.image_url ? String(item.image_url) : null},visible=${Boolean(item.visible)},sort_order=${Number(item.sort_order) || 0} WHERE id=${item.id}`;
      }
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Sección no válida" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "No fue posible guardar los cambios" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await isAdminSession(request)) || !sql) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  let body: { section?: string; id?: string };
  try { body = await readObject(request, 2000) as typeof body; } catch { return NextResponse.json({error:'Datos inválidos'},{status:400}); }
  if (!body.id || !["services", "projects", "images"].includes(body.section || "")) return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  try {
    if (body.section === "services") await sql`DELETE FROM services WHERE id=${body.id}`;
    if (body.section === "projects") await sql`DELETE FROM projects WHERE id=${body.id}`;
    if (body.section === "images") await sql`DELETE FROM site_images WHERE id=${body.id}`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No fue posible eliminar el elemento" }, { status: 500 });
  }
}
