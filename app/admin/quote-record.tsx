"use client";

import { CalendarDays, Mail, MapPin, Phone, Trash2 } from "lucide-react";
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

  return <article className="quote-record">
    <header className="quote-record-head">
      <div className="quote-identity"><span className="quote-avatar">{name.slice(0, 2).toUpperCase()}</span><span><b>{name}</b><small>{item.company || "Cliente particular"}</small></span></div>
      <div className="quote-record-actions">
        <label className="sr-only" htmlFor={`quote-status-${item.id}`}>Estado de la cotización de {name}</label>
        <select id={`quote-status-${item.id}`} className={`status-select ${item.status || "new"}`} value={item.status || "new"} disabled={savingStatus || deleting} onChange={async event => { setSavingStatus(true); try { await onStatusChange(item.id, event.target.value); } finally { setSavingStatus(false); } }}><option value="new">Nueva</option><option value="reviewed">Revisada</option><option value="contacted">Contactada</option><option value="closed">Cerrada</option></select>
        <button className="quote-delete-trigger" type="button" disabled={deleting} onClick={() => setConfirming(true)} aria-label={`Eliminar cotización de ${name}`}><Trash2 size={16} /><span>Eliminar</span></button>
      </div>
    </header>
    <div className="quote-contact-grid">
      <a href={`mailto:${item.email || ""}`}><Mail /><span><small>Correo</small><b>{item.email || "Sin correo"}</b></span></a>
      <a href={`tel:${(item.phone || "").replace(/[^\d+]/g, "")}`}><Phone /><span><small>Teléfono</small><b>{item.phone || "Sin teléfono"}</b></span></a>
      <div><MapPin /><span><small>Comuna</small><b>{item.city || "Sin comuna"}</b></span></div>
      <div><CalendarDays /><span><small>Recibida</small><b>{created}</b></span></div>
    </div>
    <div className="quote-request-details"><div className="quote-service"><small>Servicio solicitado</small><b>{item.service_name || "Sin especificar"}</b></div><div className="quote-message"><small>Mensaje del cliente</small><p>{item.message || "Sin mensaje"}</p></div></div>
    <QuoteFollowup item={item} />
    {confirming && <div className="quote-delete-confirm" role="group" aria-label={`Confirmar eliminación de la cotización de ${name}`}><div><b>¿Eliminar esta cotización?</b><p>Se borrarán la solicitud, sus notas internas y el historial de avisos por correo. Esta acción no se puede deshacer.</p></div><div><button type="button" className="button button-white" disabled={deleting} onClick={() => setConfirming(false)}>Cancelar</button><button type="button" className="button quote-delete-confirm-button" disabled={deleting} onClick={deleteQuote}><Trash2 size={16} /> {deleting ? "Eliminando…" : "Sí, eliminar"}</button></div></div>}
  </article>;
}
