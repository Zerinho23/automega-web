import { sql } from '@/lib/neon';

export type NotificationAttempt = { kind: string; status: 'sent' | 'pending' | 'failed'; error?: string };

export async function notifyQuote(quote: { id: string; name: string; email: string; service_name: string; city: string; message: string }) {
  const attempts: NotificationAttempt[] = [];
  if (!sql) return attempts;
  const recipient = process.env.NOTIFICATION_EMAIL || process.env.ADMIN_EMAIL;
  if (!recipient) return attempts;
  const messages = [
    { kind: 'admin', to: recipient, subject: 'Nueva cotización · AUTOMEGA SpA', text: `${quote.name}\n${quote.email}\n${quote.service_name} · ${quote.city}\n\n${quote.message}` },
    { kind: 'confirmation', to: quote.email, subject: 'Recibimos tu solicitud · AUTOMEGA SpA', text: `Hola ${quote.name},\n\nRecibimos tu solicitud de ${quote.service_name}. Nuestro equipo te contactará a la brevedad.\n\nAUTOMEGA SpA` },
  ];
  for (const message of messages) {
    await sql`INSERT INTO email_notifications (quote_id,recipient,kind) VALUES (${quote.id},${message.to},${message.kind}) ON CONFLICT (quote_id,kind) DO NOTHING`;
    const previous=await sql`SELECT status FROM email_notifications WHERE quote_id=${quote.id} AND kind=${message.kind}`;
    if(previous[0]?.status === 'sent') { attempts.push({kind:message.kind,status:'sent'}); continue; }
    if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) { attempts.push({kind:message.kind,status:'pending',error:'Faltan RESEND_API_KEY o EMAIL_FROM'}); continue; }
    try {
      const response = await fetch('https://api.resend.com/emails', { method: 'POST', signal: AbortSignal.timeout(8000), headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `quote-${quote.id}-${message.kind}` }, body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [message.to], subject: message.subject, text: message.text }) });
      await sql`UPDATE email_notifications SET status=${response.ok ? 'sent' : 'failed'} WHERE quote_id=${quote.id} AND kind=${message.kind}`;
      if (response.ok) attempts.push({kind:message.kind,status:'sent'});
      else {
        const payload = await response.json().catch(() => null) as {message?:string} | null;
        attempts.push({kind:message.kind,status:'failed',error:payload?.message || `Resend respondió con código ${response.status}`});
      }
    } catch (error) {
      await sql`UPDATE email_notifications SET status='failed' WHERE quote_id=${quote.id} AND kind=${message.kind}`;
      attempts.push({kind:message.kind,status:'failed',error:error instanceof Error ? error.message : 'No fue posible conectar con Resend'});
    }
  }
  return attempts;
}
