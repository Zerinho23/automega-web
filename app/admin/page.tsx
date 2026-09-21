"use client";
import { ArrowRight, CheckCircle2, Clock3, FileText, FolderKanban, HardHat, Image as ImageIcon, Mail, Pencil, RefreshCw, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [data,setData] = useState<{counts:{newQuotes:number;projects:number;services:number;images:number};recent:any[];settings:Record<string,string>}>({counts:{newQuotes:0,projects:0,services:0,images:0},recent:[],settings:{}});
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [updatedAt,setUpdatedAt] = useState('');
  async function refresh() {
    setLoading(true); setError('');
    try { const response = await fetch('/api/admin/summary',{cache:'no-store'}); if (!response.ok) throw new Error('No se pudo consultar el resumen'); const value = await response.json() as typeof data; setData(value); setUpdatedAt(new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})); }
    catch { setError('No pudimos actualizar los datos.'); }
    finally { setLoading(false); }
  }
  useEffect(()=>{void refresh();},[]);
  const counts=data.counts;
  const recentRows=data.recent.length?data.recent.map((row:any)=>[row.name,row.service_name,row.message,row.city,new Date(row.created_at).toLocaleDateString("es-CL"),row.status === "new" ? "Nueva" : row.status === "reviewed" ? "Revisada" : row.status === "contacted" ? "Contactada" : "Cerrada",row.status]):[];
  const heroStyle = data.settings.hero_image ? { backgroundImage:`linear-gradient(90deg,rgba(8,20,31,.96) 0%,rgba(8,20,31,.78) 52%,rgba(8,20,31,.28) 100%),url("${data.settings.hero_image}")` } : undefined;
  const stats=[
    {Icon:FileText,label:"Solicitudes nuevas",value:counts.newQuotes,detail:"Pendientes de revisión",href:"/admin/quotes"},
    {Icon:FolderKanban,label:"Proyectos publicados",value:counts.projects,detail:"Visibles en el sitio",href:"/admin/projects"},
    {Icon:HardHat,label:"Servicios activos",value:counts.services,detail:"Servicios publicados",href:"/admin/services"},
    {Icon:ImageIcon,label:"Imágenes",value:counts.images,detail:"Recursos visuales publicados",href:"/admin/images"},
  ];
  return <>
    <section className="dashboard-hero" style={heroStyle}><div className="dashboard-hero-copy"><span className="dashboard-kicker">CENTRO DE CONTROL · AUTOMEGA SpA</span><h1>Resumen operativo</h1><p>Gestiona solicitudes, proyectos y contenido del sitio desde un solo lugar.</p><div className="dashboard-hero-status"><div><CheckCircle2 /><span><b>{error ? 'Revisión necesaria' : 'Contenido conectado'}</b><small>{error ? 'No se pudo verificar la información' : 'Información obtenida desde la base de datos'}</small></span></div><div><Clock3 /><span><b>{loading ? 'Consultando datos' : 'Última consulta'}</b><small>{updatedAt || 'Esperando actualización'}</small></span></div></div></div><div className="dashboard-hero-side"><span>Gestión centralizada</span><strong>Tu sitio y sus solicitudes, en una sola vista.</strong><button className="dashboard-refresh" onClick={() => void refresh()} disabled={loading}><RefreshCw /> {loading ? 'Actualizando…' : 'Actualizar datos'}</button></div></section>
    {error && <div className="data-error-banner" role="alert"><span>{error} Las cifras podrían estar desactualizadas.</span><button className="button button-white" onClick={() => void refresh()}>Reintentar</button></div>}
    <section className="stats-grid">{stats.map(({Icon,label,value,detail,href})=><Link className="stat-card" href={href} key={label}><span><Icon /></span><div><b>{label}</b><strong>{loading || error ? "—" : String(value).padStart(2,"0")}</strong><p>{detail}</p></div><ArrowRight className="stat-arrow" /></Link>)}</section>
    <div className="admin-two-col dashboard-main-grid">
      <section className="admin-card"><div className="card-title"><div><i />Solicitudes recientes</div><Link href="/admin/quotes">Ver todas <ArrowRight /></Link></div><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Mensaje</th><th>Comuna</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{recentRows.length?recentRows.map((row,index)=><tr key={`${row[0]}-${index}`}><td><b>{row[0]}</b></td><td>{row[1]}</td><td className="request-message">{row[2]}</td><td>{row[3]}</td><td>{row[4]}</td><td><span className={`status ${row[6]}`}>{row[5]}</span></td></tr>):<tr><td colSpan={6} className="empty-table"><FileText /> <b>No hay solicitudes registradas todavía.</b><span>Las solicitudes enviadas desde la web aparecerán aquí.</span></td></tr>}</tbody></table></div></section>
      <section className="admin-card quick-card"><div className="card-title"><div><i />Acciones rápidas</div><span className="card-caption">Atajos frecuentes</span></div><div className="quick-grid"><Link href="/admin/home"><ImageIcon /><span><b>Cambiar imagen principal</b><small>Actualiza la portada</small></span><ArrowRight /></Link><Link href="/admin/services"><HardHat /><span><b>Editar servicios</b><small>Gestiona tu catálogo</small></span><ArrowRight /></Link><Link href="/admin/contact"><Mail /><span><b>Actualizar contacto</b><small>Teléfono y cobertura</small></span><ArrowRight /></Link><Link href="/admin/projects"><b>+</b><span><b>Agregar proyecto</b><small>Nuevo trabajo realizado</small></span><ArrowRight /></Link></div></section>
    </div>
    <section className="admin-card content-card"><div className="card-title"><div><i />Contenido del sitio</div><span className="card-caption">Acceso directo a la información publicada</span></div><div className="table-wrap"><table><thead><tr><th>Sección</th><th>Contenido actual</th><th>Tipo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{[["Título principal",data.settings.hero_title||"Seguridad y control en cada vía","Texto","/admin/home"],["Cobertura",data.settings.coverage||"Concepción y toda la Región del Biobío","Texto","/admin/contact"],["Correo de contacto",data.settings.email||"diego.mora@automegaspa.com","Contacto","/admin/contact"]].map(row=><tr key={row[0]}><td><b>{row[0]}</b></td><td>{row[1]}</td><td>{row[2]}</td><td><span className="published">● &nbsp; Publicado</span></td><td><Link className="small-action" href={row[3]}><Pencil /> Editar</Link></td></tr>)}</tbody></table></div><Link href="/admin/home" className="button button-yellow"><Save /> Administrar portada</Link></section>
  </>;
}
