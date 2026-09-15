import { NextResponse } from "next/server";
import { sql } from "@/lib/neon";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!sql) return NextResponse.json({ settings: {}, services: [], projects: [] });
  try {
    const [settings, services, projects] = await Promise.all([
      sql`SELECT key,value FROM site_settings`,
      sql`SELECT title,description,icon FROM services WHERE visible=true ORDER BY sort_order`,
      sql`SELECT title,description,location,image_url FROM projects WHERE visible=true ORDER BY sort_order`,
    ]);
    const settingsMap = Object.fromEntries(settings.map((row: any) => [row.key, row.value]));
    const fallbackProjects = [
      { title:"Obras urbanas Concepción", description:"Conificación vial", location:"Concepción" },
      { title:"Desvío ruta regional", description:"Señalización temporal", location:"San Pedro de la Paz" },
      { title:"Apoyo en faena", description:"Control del tránsito", location:"Talcahuano" },
    ];
    const projectRows = (projects.length ? projects : fallbackProjects).map((project: any, index: number) => ({ ...project, image_url: project.image_url || settingsMap[`project_image_project-${index + 1}`] || null }));
    return NextResponse.json({ settings: settingsMap, services, projects: projectRows }, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch { return NextResponse.json({ settings: {}, services: [], projects: [] }); }
}
