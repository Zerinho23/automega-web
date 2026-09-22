"use client";

import {
  ArrowDown, ArrowUp, BadgeCheck, Building2, CalendarDays, CheckCircle2,
  Clock3, Eye, EyeOff, FileImage, HardHat, Image as ImageIcon, KeyRound,
  Mail, MapPin, MessageSquareText, Phone, Plus, Save, ShieldCheck, Sparkles,
  Trash2, Upload, UsersRound
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { createClient } from "@/lib/supabase/client";
import QuoteRecord from './quote-record';
import NotificationStatus from './notification-status';

type Item = {
  id: string; title: string; description: string; visible: boolean; sort_order: number;
  image_url?: string; storage_path?: string; location?: string; status?: string;
  name?: string; company?: string; phone?: string; email?: string; city?: string;
  service_name?: string; message?: string; created_at?: string;
};

type Settings = {
  hero_title: string; hero_text: string; about_title: string; phone: string;
  whatsapp: string; email: string; address: string; coverage: string; site_name: string;
  hero_image: string; about_image: string; logo_url: string;
};

const defaultSettings: Settings = {
  hero_title: "Seguridad y control en cada vía",
  hero_text: "Servicios de conificación y señalización vial temporal para obras, faenas y desvíos.",
  about_title: "Seguridad vial para cada trabajo", phone: "+56 9 6647 3375",
  whatsapp: "+56 9 6647 3375", email: "diego.mora@automegaspa.com",
  address: "Concepción, Región del Biobío", coverage: "Concepción y toda la Región del Biobío",
  site_name: "AUTOMEGA SpA", hero_image: "", about_image: "", logo_url: "",
};

const labels: Record<string, [string, string, string]> = {
  home: ["Página principal", "Gestiona la portada, el mensaje comercial y los recursos visuales.", "Contenido del sitio"],
  services: ["Servicios", "Organiza la oferta comercial que se publica en la página.", "Catálogo operativo"],
  projects: ["Proyectos", "Administra trabajos realizados, ubicación, fotografía y visibilidad.", "Portafolio"],
  images: ["Galería de imágenes", "Centraliza los recursos gráficos disponibles en el sitio.", "Biblioteca multimedia"],
  quotes: ["Solicitudes de cotización", "Revisa cada contacto, su necesidad y el avance comercial.", "Gestión comercial"],
  contact: ["Datos de contacto", "Mantén actualizados los canales visibles para tus clientes.", "Información pública"],
  settings: ["Configuración general", "Gestiona la identidad del sitio y la seguridad del acceso.", "Sistema"],
};

const statusLabel: Record<string, string> = { new: "Nueva", reviewed: "Revisada", contacted: "Contactada", closed: "Cerrada" };

function SectionHeading({ section, count, visible, loading, error }: { section: string; count: number; visible: number; loading: boolean; error: string }) {
  const title = labels[section] || ["Administración", "Gestiona el contenido del sitio.", "Panel administrativo"];
  return <header className="admin-page-heading"><div><span className="admin-breadcrumb">Panel / {title[2]}</span><h1>{title[0]}</h1><p>{title[1]}</p></div><div className="admin-page-health"><span className={error ? 'sync-error' : ''}><i />{loading ? 'Consultando datos…' : error ? 'Consulta pendiente' : 'Información actualizada'}</span>{!loading && !error && count > 0 && ['services','projects'].includes(section) && <small>{visible} de {count} publicados</small>}</div></header>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="admin-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function MediaCard({ title, description, image, target, onUpload }: { title: string; description: string; image?: string; target: string; onUpload: (file?: File, target?: string) => void }) {
  return <article className="media-control-card"><div className="media-control-preview">{image ? <img src={image} alt="" /> : <FileImage />}</div><div className="media-control-copy"><b>{title}</b><span>{description}</span></div><label className="media-control-action"><Upload /> Reemplazar<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => onUpload(event.target.files?.[0], target)} /></label></article>;
}

export default function AdminWorkspace({ section }: { section: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState("");
  const [quoteFilter, setQuoteFilter] = useState("all");
  const [notificationVersion, setNotificationVersion] = useState(0);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const table = section === "services" ? "services" : section === "projects" ? "projects" : section === "quotes" ? "quote_requests" : "";
  const supabase = useMemo(() => createClient(), []);

  async function loadSection() {
    setLoading(true);
    setLoadError('');
    try {
      if (!supabase) {
        const response = await fetch(`/api/admin/data?section=${section}`, { cache: "no-store" });
        if (!response.ok) throw new Error("No fue posible consultar la información");
        const payload: any = await response.json();
        if (payload.items) setItems(payload.items.map((row: any) => section === "images" ? ({ ...row, title: row.alt_text || row.file_name, description: row.file_name, image_url: row.public_url }) : row));
        if (payload.settings) setSettings(current => ({ ...current, ...payload.settings }));
        return;
      }
      if (table) {
        const { data, error } = await supabase.from(table).select("*").order(section === "quotes" ? "created_at" : "sort_order", { ascending: section !== "quotes" });
        if (error) throw error;
        setItems((data || []) as Item[]);
      } else if (["home", "contact", "settings"].includes(section)) {
        const { data, error } = await supabase.from("site_settings").select("key,value");
        if (error) throw error;
        if (data) setSettings(current => ({ ...current, ...Object.fromEntries(data.map((row: any) => [row.key, row.value])) }));
      } else if (section === "images") {
        const { data, error } = await supabase.from("site_images").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setItems((data || []).map((row: any) => ({ ...row, title: row.alt_text || row.file_name, description: row.file_name, image_url: row.public_url })));
      }
    } catch (error) { const message = error instanceof Error ? error.message : 'No fue posible actualizar los datos'; setLoadError(message); toast.error(message); }
    finally { setLoading(false); }
  }

  useEffect(() => { void loadSection(); }, [section]);

  const visibleCount = items.filter(item => item.visible).length;
  const filteredQuotes = items.filter(item => {
    const matchesStatus = quoteFilter === "all" || item.status === quoteFilter;
    const haystack = `${item.name || ""} ${item.company || ""} ${item.email || ""} ${item.city || ""} ${item.service_name || ""}`.toLowerCase();
    return matchesStatus && haystack.includes(query.toLowerCase());
  });
  const quoteCounts = {
    new: items.filter(item => item.status === "new").length,
    progress: items.filter(item => item.status === "reviewed" || item.status === "contacted").length,
    closed: items.filter(item => item.status === "closed").length,
  };

  function update(id: string, patch: Partial<Item>) { setItems(list => list.map(item => item.id === id ? { ...item, ...patch } : item)); }
  function updateSetting(key: keyof Settings, value: string) { setSettings(current => ({ ...current, [key]: value })); }
  function move(id: string, direction: -1 | 1) { setItems(list => { const index = list.findIndex(item => item.id === id); const next = index + direction; if (index < 0 || next < 0 || next >= list.length) return list; const copy = [...list]; [copy[index], copy[next]] = [copy[next], copy[index]]; return copy.map((item, position) => ({ ...item, sort_order: position + 1 })); }); }
  function addItem() { setItems(list => [...list, { id: `draft-${Date.now()}`, title: section === "services" ? "Nuevo servicio" : "Nuevo proyecto", description: "", location: section === "projects" ? "Concepción" : undefined, visible: false, sort_order: list.length + 1 }]); }

  async function removeItem(id: string) {
    if (!id.startsWith("draft-")) { const response = await fetch("/api/admin/data", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, id }) }); if (!response.ok) { toast.error("No fue posible eliminar el elemento"); return; } }
    setItems(list => list.filter(item => item.id !== id)); toast.success("Elemento eliminado");
  }
  async function saveItems() {
    setLoading(true);
    try { const response = await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section, items }) }); if (!response.ok) throw new Error("No fue posible guardar los cambios"); await loadSection(); toast.success("Cambios guardados y publicados"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar"); }
    finally { setLoading(false); }
  }
  async function saveSettings() {
    setLoading(true);
    try { const response = await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "settings", settings }) }); if (!response.ok) throw new Error("No fue posible guardar la configuración"); toast.success("Configuración guardada y visible en el sitio"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar"); }
    finally { setLoading(false); }
  }
  async function uploadImage(file?: File, target = "gallery") {
    if (!file) return; setLoading(true);
    try { const form = new FormData(); form.append("file", file); form.append("target", target); const response = await fetch("/api/upload", { method: "POST", body: form }); const result: any = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || "No fue posible cargar la imagen"); const imageUrl = String(result.publicUrl || ""); if (target.startsWith("project:")) update(target.slice("project:".length), { image_url: imageUrl }); else if (target === "gallery") await loadSection(); else updateSetting(target === "hero" ? "hero_image" : target === "logo" ? "logo_url" : "about_image", imageUrl); toast.success("Imagen guardada correctamente"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible guardar la imagen"); }
    finally { setLoading(false); }
  }
  async function updateQuoteStatus(id: string, status: string) { update(id, { status }); const response = await fetch("/api/admin/data", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ section: "quotes", id, status }) }); if (!response.ok) { toast.error("No fue posible actualizar el estado"); await loadSection(); return; } toast.success(`Solicitud marcada como ${statusLabel[status].toLowerCase()}`); }
  async function changePassword(form: FormData) { const password = String(form.get("password") || ""); const confirm = String(form.get("confirm") || ""); if (password.length < 8) { toast.error("La contraseña debe tener al menos 8 caracteres"); return; } if (password !== confirm) { toast.error("Las contraseñas no coinciden"); return; } setLoading(true); try { const response = await fetch("/api/admin/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) }); const result: any = await response.json().catch(() => ({})); if (!response.ok) throw new Error(result.error || "No fue posible actualizar la contraseña"); toast.success("Contraseña actualizada de forma segura"); } catch (error) { toast.error(error instanceof Error ? error.message : "No fue posible actualizar la contraseña"); } finally { setLoading(false); } }

  return <>
    <Toaster richColors position="top-right" />
    <SectionHeading section={section} count={items.length} visible={visibleCount} loading={loading} error={loadError} />
    {loadError && <div className="data-error-banner" role="alert"><span>{loadError}. Los datos no pudieron verificarse.</span><button className="button button-white" onClick={() => void loadSection()}>Reintentar</button></div>}
    {section === 'quotes' && <NotificationStatus key={notificationVersion}/>}
    {loading && <div className="admin-loading"><span /> Sincronizando información…</div>}

    {(section === "services" || section === "projects") && <>
      <section className="module-metrics"><article><span><BadgeCheck /></span><div><b>{visibleCount}</b><small>Publicados</small></div></article><article><span><EyeOff /></span><div><b>{items.length - visibleCount}</b><small>Ocultos</small></div></article><article><span><HardHat /></span><div><b>{items.length}</b><small>{section === "services" ? "Servicios totales" : "Proyectos totales"}</small></div></article></section>
      <section className="admin-card editor-card pro-editor-card"><div className="editor-toolbar"><div><span className="panel-kicker">Contenido publicado</span><h2>{section === "services" ? "Catálogo de servicios" : "Portafolio de proyectos"}</h2><p>Edita los datos, cambia el orden y controla qué elementos aparecen en la web.</p></div><button className="button button-yellow" onClick={addItem}><Plus /> Agregar {section === "services" ? "servicio" : "proyecto"}</button></div><div className="editor-list">
        {items.length === 0 && !loading && <div className="professional-empty"><HardHat /><h3>Aún no hay contenido en este módulo</h3><p>Agrega el primer elemento para comenzar a publicarlo en el sitio web.</p><button className="button button-yellow" onClick={addItem}><Plus /> Crear ahora</button></div>}
        {items.map((item, index) => <article className="content-editor-card" key={item.id}><header><div className="item-number">{String(index + 1).padStart(2, "0")}</div><div><b>{item.title || "Sin título"}</b><small>{item.visible ? "Visible en el sitio web" : "Guardado como borrador"}</small></div><button className={`visibility ${item.visible ? "on" : ""}`} onClick={() => update(item.id, { visible: !item.visible })}>{item.visible ? <Eye /> : <EyeOff />}{item.visible ? "Publicado" : "Oculto"}</button></header><div className={`content-editor-body ${section === "services" ? "service-editor-body" : ""}`}>{section === "projects" && <div className="project-media-editor"><div>{item.image_url ? <img src={item.image_url} alt="" /> : <ImageIcon />}</div><label><Upload /> {item.image_url ? "Reemplazar foto" : "Agregar fotografía"}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => uploadImage(event.target.files?.[0], `project:${item.id}`)} /></label></div>}<div className="content-editor-fields"><Field label={section === "services" ? "Nombre del servicio" : "Nombre del proyecto"}><input value={item.title} onChange={event => update(item.id, { title: event.target.value })} /></Field><Field label="Descripción" hint={`${item.description.length}/240 caracteres`}><textarea maxLength={240} rows={3} value={item.description} onChange={event => update(item.id, { description: event.target.value })} /></Field>{section === "projects" && <Field label="Comuna o ubicación"><div className="input-with-icon"><MapPin /><input value={item.location || ""} onChange={event => update(item.id, { location: event.target.value })} /></div></Field>}</div></div><footer><div className="order-control"><span>Orden de aparición</span><button disabled={index === 0} onClick={() => move(item.id, -1)}><ArrowUp /> Subir</button><button disabled={index === items.length - 1} onClick={() => move(item.id, 1)}><ArrowDown /> Bajar</button></div><button className="danger-text-button" onClick={() => removeItem(item.id)}><Trash2 /> Eliminar</button></footer></article>)}
      </div>{items.length > 0 && <div className="sticky-save-bar"><div><CheckCircle2 /><span><b>Cambios listos para publicar</b><small>Se actualizarán inmediatamente en el sitio.</small></span></div><button className="button button-yellow" disabled={loading} onClick={saveItems}><Save /> {loading ? "Guardando…" : "Guardar y publicar"}</button></div>}</section>
    </>}

    {section === "quotes" && <>
      <section className="module-metrics quotes-metrics">
        <article><span><Sparkles /></span><div><b>{quoteCounts.new}</b><small>Nuevas</small></div></article>
        <article><span><Clock3 /></span><div><b>{quoteCounts.progress}</b><small>En seguimiento</small></div></article>
        <article><span><CheckCircle2 /></span><div><b>{quoteCounts.closed}</b><small>Cerradas</small></div></article>
      </section>
      <section className="admin-card quotes-panel">
        <div className="data-toolbar">
          <div><span className="panel-kicker">Bandeja comercial</span><h2>Solicitudes recibidas</h2><p className="quote-results">{filteredQuotes.length} de {items.length} {items.length === 1 ? "solicitud" : "solicitudes"}</p></div>
          <div><input type="search" aria-label="Buscar cotizaciones" placeholder="Buscar cliente, correo o comuna…" value={query} onChange={event => setQuery(event.target.value)} /><select aria-label="Filtrar cotizaciones por estado" value={quoteFilter} onChange={event => setQuoteFilter(event.target.value)}><option value="all">Todos los estados</option><option value="new">Nuevas</option><option value="reviewed">Revisadas</option><option value="contacted">Contactadas</option><option value="closed">Cerradas</option></select></div>
        </div>
        {filteredQuotes.length === 0 ? <div className="professional-empty"><MessageSquareText /><h3>{items.length ? "No hay resultados para este filtro" : "Aún no hay solicitudes"}</h3><p>{items.length ? "Prueba con otra búsqueda o selecciona todos los estados." : "Las cotizaciones enviadas desde el formulario aparecerán aquí automáticamente."}</p></div> :
          <div className={`quote-list ${filteredQuotes.length === 1 ? "quote-list-single" : ""}`}>{filteredQuotes.map(item => <QuoteRecord key={item.id} item={item} onStatusChange={updateQuoteStatus} onDeleted={id => { setItems(list => list.filter(quote => quote.id !== id)); setNotificationVersion(version => version + 1); }} />)}</div>}
      </section>
    </>}

    {section === "images" && <><section className="module-metrics"><article><span><ImageIcon /></span><div><b>{items.length}</b><small>Archivos disponibles</small></div></article><article><span><BadgeCheck /></span><div><b>{visibleCount}</b><small>Imágenes activas</small></div></article><article><span><ShieldCheck /></span><div><b>4 MB</b><small>Tamaño máximo</small></div></article></section><section className="admin-card media-library"><div className="editor-toolbar"><div><span className="panel-kicker">Gestor de archivos</span><h2>Biblioteca multimedia</h2><p>Usa nombres descriptivos para identificar cada recurso con facilidad.</p></div></div><label className="upload-zone pro-upload-zone"><span className="upload-icon"><Upload /></span><strong>Arrastra o selecciona una imagen</strong><span>PNG, JPG o WebP · máximo 4 MB</span><em>Seleccionar archivo</em><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => uploadImage(event.target.files?.[0])} /></label>{items.length === 0 ? <div className="professional-empty compact-empty"><ImageIcon /><h3>La biblioteca está vacía</h3><p>Las imágenes que cargues quedarán disponibles y almacenadas en Neon.</p></div> : <div className="image-admin-grid pro-image-grid">{items.map(item => <article key={item.id}>{item.image_url ? <img src={item.image_url} alt={item.title} /> : <div className="image-placeholder"><ImageIcon /></div>}<div className="image-card-meta"><div><b>{item.title}</b><small>{item.created_at ? new Date(item.created_at).toLocaleDateString("es-CL") : "Imagen del sitio"}</small></div><button aria-label="Eliminar imagen" onClick={() => removeItem(item.id)}><Trash2 /></button></div></article>)}</div>}</section></>}

    {section === "home" && <><section className="home-overview-grid"><article><span>01</span><div><b>Portada principal</b><small>Mensaje y llamado a la acción</small></div></article><article><span>02</span><div><b>Identidad visual</b><small>Logo y fotografías corporativas</small></div></article><article><span>03</span><div><b>Sección institucional</b><small>Presentación de AUTOMEGA SpA</small></div></article></section><div className="home-admin-layout"><section className="admin-card settings-form pro-settings-form"><div className="form-card-heading"><span><MessageSquareText /></span><div><h2>Textos principales</h2><p>Contenido visible en la portada y presentación institucional.</p></div></div><Field label="Título principal" hint={`${settings.hero_title.length}/80 caracteres`}><input maxLength={80} value={settings.hero_title} onChange={event => updateSetting("hero_title", event.target.value)} /></Field><Field label="Texto de portada" hint={`${settings.hero_text.length}/240 caracteres`}><textarea maxLength={240} rows={5} value={settings.hero_text} onChange={event => updateSetting("hero_text", event.target.value)} /></Field><Field label="Título Sobre AUTOMEGA SpA"><input value={settings.about_title} onChange={event => updateSetting("about_title", event.target.value)} /></Field></section><section className="admin-card media-manager-card"><div className="form-card-heading"><span><ImageIcon /></span><div><h2>Recursos visuales</h2><p>Reemplaza imágenes sin perder el contenido escrito.</p></div></div><div className="media-control-list"><MediaCard title="Logo corporativo" description="PNG o WebP con fondo transparente" image={settings.logo_url} target="logo" onUpload={uploadImage} /><MediaCard title="Imagen principal" description="Fotografía horizontal de portada" image={settings.hero_image} target="hero" onUpload={uploadImage} /><MediaCard title="Imagen institucional" description="Fotografía de la sección Sobre nosotros" image={settings.about_image} target="about" onUpload={uploadImage} /></div></section></div><div className="sticky-save-bar standalone-save"><div><CheckCircle2 /><span><b>Contenido conectado a la web pública</b><small>Los cambios se verán al guardar.</small></span></div><button className="button button-yellow" disabled={loading} onClick={saveSettings}><Save /> Guardar y publicar</button></div></>}

    {section === "contact" && <div className="contact-admin-layout"><section className="admin-card settings-form pro-settings-form"><div className="form-card-heading"><span><UsersRound /></span><div><h2>Canales de atención</h2><p>Datos que los visitantes usarán para contactar a AUTOMEGA SpA.</p></div></div><div className="form-grid-two"><Field label="Teléfono"><div className="input-with-icon"><Phone /><input value={settings.phone} onChange={event => updateSetting("phone", event.target.value)} /></div></Field><Field label="WhatsApp"><div className="input-with-icon"><MessageSquareText /><input value={settings.whatsapp} onChange={event => updateSetting("whatsapp", event.target.value)} /></div></Field></div><Field label="Correo electrónico"><div className="input-with-icon"><Mail /><input type="email" value={settings.email} onChange={event => updateSetting("email", event.target.value)} /></div></Field><Field label="Dirección base"><div className="input-with-icon"><MapPin /><input value={settings.address} onChange={event => updateSetting("address", event.target.value)} /></div></Field><Field label="Área de cobertura"><textarea rows={3} value={settings.coverage} onChange={event => updateSetting("coverage", event.target.value)} /></Field><button className="button button-yellow full-save" disabled={loading} onClick={saveSettings}><Save /> Guardar datos de contacto</button></section><aside className="contact-preview-card"><span className="panel-kicker">Vista previa</span><h2>Información pública</h2><p>Así se presentan tus principales canales de atención.</p><div><span><Phone /></span><small>Teléfono</small><b>{settings.phone}</b></div><div><span><MessageSquareText /></span><small>WhatsApp</small><b>{settings.whatsapp}</b></div><div><span><Mail /></span><small>Correo</small><b>{settings.email}</b></div><hr /><span className="coverage-preview"><MapPin /> {settings.coverage}</span></aside></div>}

    {section === "settings" && <><section className="security-overview"><article><ShieldCheck /><div><b>Acceso protegido</b><small>Sesión segura de 8 horas</small></div><span>Activo</span></article><article><BadgeCheck /><div><b>Base de datos</b><small>Contenido sincronizado con Neon</small></div><span>Conectada</span></article><article><Building2 /><div><b>Sitio público</b><small>Producción disponible en Vercel</small></div><span>En línea</span></article></section><div className="admin-two-col settings-columns pro-settings-columns"><section className="admin-card settings-form pro-settings-form"><div className="form-card-heading"><span><Building2 /></span><div><h2>Identidad del sitio</h2><p>Nombre comercial y estado de publicación.</p></div></div><Field label="Nombre del sitio"><input value={settings.site_name} onChange={event => updateSetting("site_name", event.target.value)} /></Field><label className="publication-switch"><span><Eye /><b>Sitio público</b><small>La página está disponible para tus visitantes.</small></span><input type="checkbox" defaultChecked /></label><button className="button button-yellow full-save" onClick={saveSettings}><Save /> Guardar configuración</button></section><section className="admin-card settings-form pro-settings-form"><div className="form-card-heading"><span><KeyRound /></span><div><h2>Seguridad de acceso</h2><p>Actualiza periódicamente tu contraseña administrativa.</p></div></div><form action={changePassword}><Field label="Nueva contraseña" hint="Mínimo 8 caracteres"><input name="password" type="password" minLength={8} required /></Field><Field label="Confirmar contraseña"><input name="confirm" type="password" minLength={8} required /></Field><button className="button button-white full-save"><KeyRound /> Actualizar contraseña</button></form><div className="security-note"><ShieldCheck /><span><b>Recomendación de seguridad</b><small>Usa una clave única y evita compartirla por mensajes.</small></span></div></section></div></>}
  </>;
}
