import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export async function GET() {
  if (!sql) return NextResponse.json({ settings: {}, services: [], projects: [] });
  try {
    const [settings, services, projects] = await Promise.all([
      sql`SELECT key,value FROM site_settings`,
      sql`SELECT title,description,icon FROM services WHERE visible=true ORDER BY sort_order`,
      sql`SELECT title,description FROM projects WHERE visible=true ORDER BY sort_order`,
    ]);
    return NextResponse.json({ settings: Object.fromEntries(settings.map((row: any) => [row.key, row.value])), services, projects });
  } catch { return NextResponse.json({ settings: {}, services: [], projects: [] }); }
}
