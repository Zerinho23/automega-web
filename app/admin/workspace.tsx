"use client";

import { ArrowDown, ArrowUp, Check, Eye, EyeOff, Image as ImageIcon, KeyRound, Plus, Save, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

type Item = { id: string; title: string; description: string; visible: boolean; sort_order: number; image_url?: string; storage_path?: string; location?: string; status?: string; name?: string; email?: string; city?: string; service_name?: string; created_at?: string };

const initialServices: Item[] = [
  { id:"service-1", title:"Conificación vial", description:"Instalación y retiro de elementos de canalización.", visible:true, sort_order:1 },
  { id:"service-2", title:"Señalización vial temporal", description:"Señalética transitoria según normativa vigente.", visible:true, sort_order:2 },
  { id:"service-3", title:"Control temporal del tránsito", description:"Bandereros y sistemas de control vehicular.", visible:true, sort_order:3 },
];
const initialProjects: Item[] = [
  { id:"project-1", title:"Obras urbanas Concepción", description:"Conificación vial", location:"Concepción", visible:true, sort_order:1 },
  { id:"project-2", title:"Desvío ruta regional", description:"Señalización temporal", location:"San Pedro de la Paz", visible:true, sort_order:2 },
  { id:"project-3", title:"Apoyo en faena", description:"Control del tránsito", location:"Talcahuano", visible:true, sort_order:3 },
];
const initialQuotes: Item[] = [
  { id:"quote-1", title:"Constructora Sur", name:"Constructora Sur", email:"contacto@constructorasur.cl", city:"Concepción", service_name:"Conificación vial", status:"new", description:"Necesitamos apoyo para una obra urbana.", visible:true, sort_order:1, created_at:"2026-09-14" },
  { id:"quote-2", title:"Obras del Biobío", name:"Obras del Biobío", email:"obras@ejemplo.cl", city:"San Pedro", service_name:"Señalización temporal", status:"reviewed", description:"Cotizar desvío temporal.", visible:true, sort_order:2, created_at:"2026-09-13" },
];

const labels: Record<string, [string,string]> = {
  home:["Página principal","Actualiza el logo, la imagen principal, títulos y textos del sitio."], services:["Servicios","Agrega, edita, ordena, publica u oculta servicios."],
  projects:["Proyectos","Administra los trabajos realizados que aparecen en la galería."], images:["Galería de imágenes","Sube, reemplaza o elimina imágenes del sitio."],
  quotes:["Solicitudes de cotización","Revisa y actualiza el estado de cada solicitud."], contact:["Datos de contacto","Modifica teléfono, WhatsApp, correo, dirección y cobertura."],
  settings:["Configuración general","Gestiona la identidad del sitio y la seguridad de tu cuenta."],
};

export default function AdminWorkspace({ section }: { section: string }) {
  const [items, setItems] = useState<Item[]>(section === "services" ? initialServices : section === "projects" ? initialProjects : section === "quotes" ? initialQuotes : []);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ hero_title:"Seguridad y control en cada vía", hero_text:"Servicios de conificación y señalización vial temporal para obras, faenas y desvíos.", about_title:"Seguridad vial para cada trabajo", phone:"+56 9 6647 3375", whatsapp:"+56 9 6647 3375", email:"contacto@automega.cl", address:"Concepción, Región del Biobío", coverage:"Concepción y toda la Región del Biobío", site_name:"AUTOMEGA" });
  const title = labels[section] || ["Administración","Gestiona el contenido del sitio."];
  const table = section === "services" ? "services" : section === "projects" ? "projects" : section === "quotes" ? "quote_requests" : "";
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!supabase) return;
    if (table) {
      setLoading(true); supabase.from(table).select("*").order(section === "quotes" ? "created_at" : "sort_order", { ascending: section !== "quotes" }).then(({ data, error }) => { if (!error && data) setItems(data as Item[]); setLoading(false); });
    } else if (["home","contact","settings"].includes(section)) {
      supabase.from("site_settings").select("key,value").then(({ data }) => { if (data) setSettings(current => ({ ...current, ...Object.fromEntries(data.map(row => [row.key, row.value])) })); });
    } else if (section === "images") {
      supabase.from("site_images").select("*").order("created_at", { ascending:false }).then(({ data }) => { if (data) setItems(data.map(row => ({ ...row, title:row.alt_text || row.file_name, description:row.file_name, visible:row.visible, sort_order:row.sort_order || 0, image_url:row.public_url }))); });
    }
  }, [section, supabase, table]);

  function update(id: string, patch: Partial<Item>) { setItems(list => list.map(item => item.id === id ? { ...item, ...patch } : item)); }
  function move(id: string, direction: -1|1) { setItems(list => { const index=list.findIndex(i=>i.id===id); const next=index+direction; if(index<0||next<0||next>=list.length)return list; const copy=[...list]; [copy[index],copy[next]]=[copy[next],copy[index]]; return copy.map((item,i)=>({...item,sort_order:i+1})); }); }
  function addItem() { setItems(list => [...list, { id:`draft-${Date.now()}`, title:section === "services" ? "Nuevo servicio" : "Nuevo proyecto", description:"Descripción", visible:false, sort_order:list.length+1 }]); }
  async function removeItem(id:string) { if (supabase && !id.startsWith("draft-")) { const item=items.find(entry=>entry.id===id); if(section==="images"&&item?.storage_path)await supabase.storage.from("site-images").remove([item.storage_path]); const { error }=await supabase.from(table || "site_images").delete().eq("id",id); if(error){toast.error(error.message);return;} } setItems(list=>list.filter(i=>i.id!==id)); toast.success("Elemento eliminado"); }
  async function saveItems() {
    setLoading(true);
    if (supabase && table) {
      const payload=items.map(({id,...item})=>id.startsWith("draft-")?item:{id,...item}); const { error }=await supabase.from(table).upsert(payload); if(error){toast.error(error.message);setLoading(false);return;}
    }
    setLoading(false); toast.success("Cambios guardados en Neon");
  }
  async function saveSettings() {
    setLoading(true); if(supabase){const payload=Object.entries(settings).map(([key,value])=>({key,value}));const {error}=await supabase.from("site_settings").upsert(payload,{onConflict:"key"});if(error){toast.error(error.message);setLoading(false);return;}} setLoading(false);toast.success("Configuración guardada");
  }
  async function uploadImage(file?:File, target="gallery") {
    if(!file)return; setLoading(true);
    try {
      const form = new FormData(); form.append("file", file); form.append("target", target);
      const response = await fetch("/api/upload", { method:"POST", body:form });
      const result = await response.json() as { error?: string; publicUrl?: string }; if (!response.ok) throw new Error(result.error || "No fue posible cargar la imagen");
      const imageUrl = String(result.publicUrl); setItems(list=>[{id:`image-${Date.now()}`,title:file.name,description:"Imagen guardada en Neon",visible:true,sort_order:0,image_url:imageUrl},...list]);
      if(target!=="gallery"){const key=target==="hero"?"hero_image":"logo_url";setSettings(current=>{const next={...current,[key]:imageUrl};try{localStorage.setItem("automega_site_settings",JSON.stringify(next));}catch{}return next;});}
      toast.success("Imagen guardada correctamente");
    } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar la imagen"); }
    setLoading(false);
  }
  async function changePassword(form:FormData){const password=String(form.get("password"));if(password.length<8){toast.error("La contraseña debe tener al menos 8 caracteres");return;}if(supabase){const{error}=await supabase.auth.updateUser({password});if(error){toast.error(error.message);return;}}toast.success("Contraseña actualizada");}

  return <>
    <Toaster richColors position="top-right" />
    <div className="admin-title"><div><div className="eyebrow" /><h1>{title[0]}</h1><p>{title[1]}</p></div></div>
    {loading && <div className="admin-loading">Actualizando información…</div>}
    {(section === "services" || section === "projects") && <section className="admin-card editor-card"><div className="editor-toolbar"><div><h2>{section === "services" ? "Servicios publicados" : "Proyectos y trabajos"}</h2>{section === "projects" && <p className="editor-hint">Edita el contenido y cambia la fotografía de cada proyecto.</p>}</div><button className="button button-yellow" onClick={addItem}><Plus /> Agregar</button></div><div className="editor-list">{items.map(item=><article className="editor-row" key={item.id}>{section === "projects" && <div className="editor-thumb">{item.image_url ? <img src={item.image_url} alt="" /> : <ImageIcon />}</div>}<div className="order-buttons"><button onClick={()=>move(item.id,-1)} aria-label="Subir"><ArrowUp /></button><button onClick={()=>move(item.id,1)} aria-label="Bajar"><ArrowDown /></button></div><div className="editor-fields"><input value={item.title} onChange={e=>update(item.id,{title:e.target.value})}/><textarea value={item.description} onChange={e=>update(item.id,{description:e.target.value})}/>{section === "projects" && <><input placeholder="Ubicación" value={item.location||""} onChange={e=>update(item.id,{location:e.target.value})}/><label className="project-upload">Cambiar imagen<input type="file" accept="image/*" onChange={e=>uploadImage(e.target.files?.[0],`project:${item.id}`)}/></label></>}</div><button className={`visibility ${item.visible?"on":""}`} onClick={()=>update(item.id,{visible:!item.visible})}>{item.visible?<Eye/>:<EyeOff/>}{item.visible?"Publicado":"Oculto"}</button><button className="icon-button danger" onClick={()=>removeItem(item.id)}><Trash2 /></button></article>)}</div><button className="button button-yellow save-bottom" onClick={saveItems}><Save /> {loading?"Guardando…":"Guardar cambios"}</button></section>}
    {section === "quotes" && <section className="admin-card"><div className="table-wrap"><table><thead><tr><th>Cliente</th><th>Correo</th><th>Servicio</th><th>Comuna</th><th>Estado</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.name}</strong><small className="cell-detail">{item.description}</small></td><td>{item.email}</td><td>{item.service_name}</td><td>{item.city}</td><td><select className={`status-select ${item.status}`} value={item.status} onChange={async e=>{const status=e.target.value;update(item.id,{status});if(supabase)await supabase.from("quote_requests").update({status}).eq("id",item.id);toast.success("Estado actualizado");}}><option value="new">Nueva</option><option value="reviewed">Revisada</option><option value="contacted">Contactada</option><option value="closed">Cerrada</option></select></td></tr>)}</tbody></table></div></section>}
    {section === "images" && <section className="admin-card"><label className="upload-zone"><Upload /><strong>Subir una imagen</strong><span>PNG, JPG o WebP · hasta 8 MB</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e.target.files?.[0])}/></label><div className="image-admin-grid">{items.length===0?<div className="empty-state"><ImageIcon/><strong>Aún no hay imágenes</strong><span>Las imágenes cargadas aparecerán aquí.</span></div>:items.map(item=><article key={item.id}>{item.image_url?<img src={item.image_url} alt={item.title}/>:<div className="image-placeholder"><ImageIcon/></div>}<div><input value={item.title} onChange={e=>update(item.id,{title:e.target.value})}/><button onClick={()=>removeItem(item.id)}><Trash2/></button></div></article>)}</div></section>}
    {(section === "home" || section === "contact") && <section className="admin-card settings-form"><h2>{section === "home"?"Contenido principal":"Información de contacto"}</h2>{(section === "home" ? [["hero_title","Título principal"],["hero_text","Texto de portada"],["about_title","Título Sobre AUTOMEGA"]] : [["phone","Teléfono"],["whatsapp","WhatsApp"],["email","Correo"],["address","Dirección"],["coverage","Cobertura"]]).map(([key,label])=><label key={key}>{label}{key.includes("text")?<textarea rows={4} value={settings[key as keyof typeof settings]} onChange={e=>setSettings({...settings,[key]:e.target.value})}/>:<input value={settings[key as keyof typeof settings]} onChange={e=>setSettings({...settings,[key]:e.target.value})}/>}</label>)}{section === "home" && <div className="upload-pair"><label className="upload-inline">Cambiar logo<input type="file" accept="image/*" onChange={e=>uploadImage(e.target.files?.[0],"logo")}/></label><label className="upload-inline">Cambiar imagen principal<input type="file" accept="image/*" onChange={e=>uploadImage(e.target.files?.[0],"hero")}/></label></div>}<button className="button button-yellow" onClick={saveSettings}><Save/> Guardar cambios</button></section>}
    {section === "settings" && <div className="admin-two-col settings-columns"><section className="admin-card settings-form"><h2>Configuración general</h2><label>Nombre del sitio<input value={settings.site_name} onChange={e=>setSettings({...settings,site_name:e.target.value})}/></label><label className="toggle-line"><input type="checkbox" defaultChecked/> Sitio público</label><button className="button button-yellow" onClick={saveSettings}><Save/> Guardar configuración</button></section><section className="admin-card settings-form"><h2>Cambiar contraseña</h2><form action={changePassword}><label>Nueva contraseña<input name="password" type="password" minLength={8} required/></label><label>Confirmar contraseña<input name="confirm" type="password" minLength={8} required/></label><button className="button button-white"><KeyRound/> Actualizar contraseña</button></form></section></div>}
  </>;
}
