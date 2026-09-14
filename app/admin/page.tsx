"use client";
import { ArrowRight, FileText, FolderKanban, HardHat, Image as ImageIcon, Mail, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const recent = [
  ["Constructora Sur", "Conificación vial", "Concepción", "14 sep 2026", "Nueva", "new"],
  ["Obras del Biobío", "Señalización temporal", "San Pedro", "13 sep 2026", "Revisada", "reviewed"],
  ["Empresa Ejemplo", "Control del tránsito", "Concepción", "12 sep 2026", "Contactada", "contacted"],
];

export default function AdminDashboard() {
  const [data,setData] = useState<{counts:{newQuotes:number;projects:number;services:number;images:number};recent:any[];settings:Record<string,string>}>({counts:{newQuotes:0,projects:0,services:0,images:0},recent:[],settings:{}});
  const [loading,setLoading] = useState(true);
  useEffect(()=>{fetch("/api/admin/summary",{cache:"no-store"}).then(r=>r.ok?r.json():null).then((value:any)=>{if(value)setData(value);}).finally(()=>setLoading(false));},[]);
  const counts=data.counts;
  const recentRows=data.recent.length?data.recent.map((row:any)=>[row.name,row.service_name,row.city,new Date(row.created_at).toLocaleDateString("es-CL"),row.status === "new" ? "Nueva" : row.status === "reviewed" ? "Revisada" : row.status === "contacted" ? "Contactada" : "Cerrada",row.status]):[];
  return <>
    <section className="dashboard-hero"><div><span className="dashboard-kicker">CENTRO DE CONTROL · AUTOMEGA</span><h1>Resumen operativo</h1><p>Supervisa solicitudes, proyectos y contenido publicado desde un solo lugar.</p></div><div className="live-badge"><span /> Sitio operativo <small>Actualizado ahora</small></div></section>
    <section className="stats-grid">{[{Icon:FileText,label:"Solicitudes nuevas",value:counts.newQuotes,detail:"Nuevas solicitudes de cotización"},{Icon:FolderKanban,label:"Proyectos publicados",value:counts.projects,detail:"Proyectos visibles en el sitio"},{Icon:HardHat,label:"Servicios activos",value:counts.services,detail:"Servicios publicados"},{Icon:ImageIcon,label:"Imágenes",value:counts.images,detail:"Imágenes en la galería"}].map(({Icon,label,value,detail})=><article className="stat-card" key={label}><span><Icon /></span><div><b>{label}</b><strong>{loading?"—":String(value).padStart(2,"0")}</strong><p>{detail}</p></div></article>)}</section>
    <div className="admin-two-col dashboard-main-grid">
      <section className="admin-card"><div className="card-title"><div><i />Solicitudes recientes</div><Link href="/admin/quotes">Ver todas <ArrowRight /></Link></div><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Comuna</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{recentRows.length?recentRows.map(row=><tr key={row[0]}>{row.slice(0,4).map(cell=><td key={String(cell)}>{String(cell)}</td>)}<td><span className={`status ${row[5]}`}>{row[4]}</span></td></tr>):<tr><td colSpan={5} className="empty-table">No hay solicitudes registradas todavía.</td></tr>}</tbody></table></div></section>
      <section className="admin-card quick-card"><div className="card-title"><div><i />Acciones rápidas</div><span className="card-caption">Atajos frecuentes</span></div><div className="quick-grid"><Link href="/admin/home"><ImageIcon /><span><b>Cambiar imagen principal</b><small>Actualiza la portada</small></span><ArrowRight /></Link><Link href="/admin/services"><HardHat /><span><b>Editar servicios</b><small>Gestiona tu catálogo</small></span><ArrowRight /></Link><Link href="/admin/contact"><Mail /><span><b>Actualizar contacto</b><small>Teléfono y cobertura</small></span><ArrowRight /></Link><Link href="/admin/projects"><b>+</b><span><b>Agregar proyecto</b><small>Nuevo trabajo realizado</small></span><ArrowRight /></Link></div></section>
    </div>
    <section className="admin-card content-card"><div className="card-title"><div><i />Contenido del sitio</div></div><div className="table-wrap"><table><thead><tr><th>Sección</th><th>Contenido actual</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{[["Título principal",data.settings.hero_title||"Seguridad y control en cada vía"],["Cobertura",data.settings.coverage||"Concepción y toda la Región del Biobío"],["Correo de contacto",data.settings.email||"contacto@automega.cl"]].map(row=><tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td><span className="published">● &nbsp; Publicado</span></td><td><Link className="small-action" href="/admin/home"><Pencil /> Editar</Link></td></tr>)}</tbody></table></div><Link href="/admin/home" className="button button-yellow"><Save /> Editar contenido</Link></section>
  </>;
}
