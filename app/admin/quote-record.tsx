"use client";

import { CalendarDays, ChevronDown, Mail, MapPin, Phone, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import QuoteFollowup from "./quote-followup";

export type QuoteRecordItem = {
  id: string;
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  city?: string;
  service_name?: string;
  message?: string;
  status?: string;
  created_at?: string;
  internal_notes?: string;
  assigned_to?: string;
  follow_up_at?: string;
};

export default function QuoteRecord({ item, onStatusChange, onDeleted }: {
  item: QuoteRecordItem;
  onStatusChange: (id: string, status: string) => Promise<void>;
  onDeleted: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const name = item.name || "Cliente sin nombre";
  const created = item.created_at ? new Date(item.created_at).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" }) : "Sin fecha";

  async function deleteQuote() {
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/data", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "quotes", id: item.id }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || "No fue posible eliminar la cotización");
      onDeleted(item.id);
      toast.success("Cotización eliminada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible eliminar la cotización");
      setDeleting(false);
    }
  }

  return <article className={`quote-entry${expanded ? " is-open" : ""}`}>
    <div className="quote-entry-row">
      <div className="quote-entry-person"><span className="quote-avatar">{name.slice(0, 2).toUpperCase()}</span><span><b>{name}</b><small>{item.company || "Cliente particular"}</small></span></div>
      <div className="quote-entry-service"><b>{item.service_name || "Sin especificar"}</b><small>{item.message || "Sin mensaje"}</small></div>
      <div className="quote-entry-place"><MapPin aria-hidden="true" />{item.city || "Sin comuna"}</div>
      <time className="quote-entry-date" dateTime={item.created_at || undefined}>{created}</time>
      <select aria-label={`Estado de la cotización de ${name}`} className={`status-select ${item.status || "new"}`} value={item.status || "new"} disabled={savingStatus || deleting} onChange={async event => { setSavingStatus(true); try { await onStatusChange(item.id, event.target.value); } finally { setSavingStatus(false); } }}><option value="new">Nueva</option><option value="reviewed">Revisada</option><option value="contacted">Contactada</option><option value="closed">Cerrada</option></select>
      <button className="quote-entry-toggle" type="button" aria-expanded={expanded} aria-controls={`quote-details-${item.id}`} onClick={() => setExpanded(value => !value)}><span>{expanded ? "Cerrar" : "Ver detalle"}</span><ChevronDown aria-hidden="true" /></button>
    </div>
    <div className="quote-entry-details" id={`quote-details-${item.id}`} hidden={!expanded}>
      <div className="quote-entry-detail-grid">
        <div className="quote-entry-message"><h3>Mensaje del cliente</h3><p>{item.message || "Sin mensaje"}</p></div>
        <div className="quote-entry-contact"><h3>Datos de contacto</h3><a href={`mailto:${item.email || ""}`} title={item.email}><Mail />{item.email || "Sin correo"}</a><a href={`tel:${(item.phone || "").replace(/[^\d+]/g, "")}`}><Phone />{item.phone || "Sin teléfono"}</a><span><MapPin />{item.city || "Sin comuna"}</span><span><CalendarDays />{created}</span></div>
      </div>
      <QuoteFollowup item={item} />
      <div className="quote-entry-footer"><span>La eliminación borra también las notas y avisos de correo asociados.</span><button className="quote-delete-trigger" type="button" disabled={deleting} onClick={() => setConfirming(true)}><Trash2 size={16} /> Eliminar cotización</button></div>
      {confirming && <div className="quote-delete-confirm" role="group" aria-label={`Confirmar eliminación de la cotización de ${name}`}><div><b>¿Eliminar la cotización de {name}?</b><p>Esta acción no se puede deshacer.</p></div><div><button type="button" className="button button-white" disabled={deleting} onClick={() => setConfirming(false)}>Cancelar</button><button type="button" className="button quote-delete-confirm-button" disabled={deleting} onClick={deleteQuote}><Trash2 size={16} /> {deleting ? "Eliminando…" : "Sí, eliminar"}</button></div></div>}
    </div>
  </article>;
}
