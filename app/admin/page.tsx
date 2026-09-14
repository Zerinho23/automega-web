import { ArrowRight, FileText, FolderKanban, HardHat, Image as ImageIcon, Mail, MapPin, Pencil, Save, TrafficCone } from "lucide-react";
import Link from "next/link";

const recent = [
  ["Constructora Sur", "Conificación vial", "Concepción", "14 sep 2026", "Nueva", "new"],
  ["Obras del Biobío", "Señalización temporal", "San Pedro", "13 sep 2026", "Revisada", "reviewed"],
  ["Empresa Ejemplo", "Control del tránsito", "Concepción", "12 sep 2026", "Contactada", "contacted"],
];

export default function AdminDashboard() {
  return <>
    <div className="admin-title"><div><div className="eyebrow" /><h1>Resumen</h1><p>Administra el contenido del sitio web de AUTOMEGA.</p></div></div>
    <section className="stats-grid">{[[FileText,"Solicitudes nuevas","08","Nuevas solicitudes de cotización"],[FolderKanban,"Proyectos publicados","12","Proyectos visibles en el sitio"],[HardHat,"Servicios activos","03","Servicios publicados"],[ImageIcon,"Imágenes","24","Imágenes en la galería"]].map(([Icon,label,value,detail])=><article className="stat-card" key={String(label)}><span><Icon /></span><div><b>{String(label)}</b><strong>{String(value)}</strong><p>{String(detail)}</p></div></article>)}</section>
    <div className="admin-two-col">
      <section className="admin-card"><div className="card-title"><div><i />Solicitudes recientes</div><Link href="/admin/quotes">Ver todas <ArrowRight /></Link></div><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Servicio</th><th>Comuna</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>{recent.map(row=><tr key={row[0]}>{row.slice(0,4).map(cell=><td key={cell}>{cell}</td>)}<td><span className={`status ${row[5]}`}>{row[4]}</span></td></tr>)}</tbody></table></div></section>
      <section className="admin-card"><div className="card-title"><div><i />Acciones rápidas</div></div><div className="quick-grid"><Link href="/admin/home"><ImageIcon />Cambiar imagen principal<ArrowRight /></Link><Link href="/admin/services"><HardHat />Editar servicios<ArrowRight /></Link><Link href="/admin/contact"><Mail />Actualizar contacto<ArrowRight /></Link><Link href="/admin/projects"><b>+</b>Agregar proyecto<ArrowRight /></Link></div></section>
    </div>
    <section className="admin-card content-card"><div className="card-title"><div><i />Contenido del sitio</div></div><div className="table-wrap"><table><thead><tr><th>Sección</th><th>Contenido actual</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>{[["Título principal","Seguridad y control en cada vía"],["Cobertura","Concepción y toda la Región del Biobío"],["Correo de contacto","contacto@automega.cl"]].map(row=><tr key={row[0]}><td>{row[0]}</td><td>{row[1]}</td><td><span className="published">● &nbsp; Publicado</span></td><td><Link className="small-action" href="/admin/home"><Pencil /> Editar</Link></td></tr>)}</tbody></table></div><button className="button button-yellow"><Save /> Guardar cambios</button></section>
  </>;
}
