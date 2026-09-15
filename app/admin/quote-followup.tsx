"use client";
import { useState } from 'react';
import { toast } from 'sonner';

export default function QuoteFollowup({ item }: { item: any }) {
  const [notes, setNotes] = useState(item.internal_notes || '');
  const [owner, setOwner] = useState(item.assigned_to || '');
  const [date, setDate] = useState(item.follow_up_at ? String(item.follow_up_at).slice(0,10) : '');
  const [saving, setSaving] = useState(false);
  async function save() {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/data', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({section:'quote_followup',id:item.id,notes,owner,date}) });
      if (!response.ok) throw new Error();
      toast.success('Seguimiento guardado');
    } catch { toast.error('No fue posible guardar el seguimiento'); }
    finally { setSaving(false); }
  }
  return <details className="quote-followup"><summary>Seguimiento interno {date && `· ${date}`}</summary><div className="form-grid-two"><label className="admin-field">Responsable<input value={owner} maxLength={120} onChange={e=>setOwner(e.target.value)}/></label><label className="admin-field">Próximo contacto<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></div><label className="admin-field">Notas internas<textarea rows={3} maxLength={4000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><button className="button button-yellow" disabled={saving} onClick={save}>{saving?'Guardando…':'Guardar seguimiento'}</button><small>Estas notas nunca aparecen en la web pública.</small></details>;
}
