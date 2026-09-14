import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  if (!cookie.includes("automega_demo_admin=active")) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  if (!sql) return NextResponse.json({ counts:{newQuotes:0,projects:0,services:0,images:0}, recent:[], settings:{} });
  try {
    const [quotes, projects, services, images, projectImages, settingImages, recent, settings] = await Promise.all([
      sql`SELECT count(*)::int AS count FROM quote_requests WHERE status='new'`,
      sql`SELECT count(*)::int AS count FROM projects WHERE visible=true`,
      sql`SELECT count(*)::int AS count FROM services WHERE visible=true`,
      sql`SELECT count(*)::int AS count FROM site_images WHERE visible=true`,
      sql`SELECT count(*)::int AS count FROM projects WHERE visible=true AND image_url IS NOT NULL`,
      sql`SELECT count(*)::int AS count FROM site_settings WHERE key IN ('hero_image','about_image','logo_url') AND value <> ''`,
      sql`SELECT name,service_name,city,created_at,status FROM quote_requests ORDER BY created_at DESC LIMIT 5`,
      sql`SELECT key,value FROM site_settings WHERE key IN ('hero_title','coverage','email')`,
    ]);
    return NextResponse.json({ counts:{newQuotes:quotes[0]?.count||0,projects:projects[0]?.count||0,services:services[0]?.count||0,images:(images[0]?.count||0)+(projectImages[0]?.count||0)+(settingImages[0]?.count||0)}, recent, settings:Object.fromEntries(settings.map((row:any)=>[row.key,row.value])) }, { headers:{"Cache-Control":"no-store"} });
  } catch { return NextResponse.json({ error:"No fue posible consultar el resumen" }, { status:500 }); }
}
