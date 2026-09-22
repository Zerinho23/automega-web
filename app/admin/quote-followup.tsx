"use client";
import { useState } from 'react';
import { toast } from 'sonner';

export default function QuoteFollowup({ item }: { item: any }) {
  const [notes, setNotes] = useState(item.internal_notes || '');
  const [owner, setOwner] = useState(item.assigned_to || '');
  const [date, setDate] = useState(item.follow_up_at ? String(item.follow_up_at).slice(0,10) : '');
  const [saved, setSaved] = useState({ notes: item.internal_notes || '', owner: item.assigned_to || '', date: item.follow_up_at ? String(item.follow_up_at).slice(0,10) : '' });
  const [saving, setSaving] = useState(false);
  const changed = notes !== saved.notes || owner !== saved.owner || date !== saved.date;
  async function save() {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/data', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({section:'quote_followup',id:item.id,notes,owner,date}) });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || 'No fue posible guardar el seguimiento');
      setSaved({ notes, owner, date });
      toast.success('Seguimiento guardado');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'No fue posible guardar el seguimiento'); }
    finally { setSaving(false); }
  }
  return <details className="quote-followup"><summary><span>Seguimiento interno</span><small>{saved.owner ? `Responsable: ${saved.owner}` : 'Agrega responsable, fecha y notas'}{saved.date && ` · ${saved.date}`}</small></summary><div className="form-grid-two"><label className="admin-field">Responsable<input value={owner} maxLength={120} placeholder="Nombre de quien hará el seguimiento" onChange={e=>setOwner(e.target.value)}/></label><label className="admin-field">Próximo contacto<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div><label className="admin-field">Notas internas<textarea rows={3} maxLength={4000} value={notes} placeholder="Acuerdos, pendientes o detalles importantes para el equipo" onChange={e=>setNotes(e.target.value)}/></label><div className="quote-followup-footer"><button type="button" className="button button-yellow" disabled={saving || !changed} onClick={save}>{saving?'Guardando…':'Guardar seguimiento'}</button><small>Solo visibles en el panel administrativo.</small></div></details>;
}
