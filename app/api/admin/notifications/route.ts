import { NextResponse } from 'next/server';
import { sql } from '@/lib/neon';
import { isAdminSession } from '@/lib/admin-session';
import { notifyQuote } from '@/lib/quote-notifications';
export const dynamic='force-dynamic';
export async function GET(request:Request) {
  if (!(await isAdminSession(request)) || !sql) return NextResponse.json({error:'No autorizado'},{status:401});
  const rows=await sql`SELECT status,count(*)::int AS count FROM email_notifications GROUP BY status`;
  return NextResponse.json({configured:Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),counts:Object.fromEntries(rows.map(row=>[row.status,row.count]))});
}
export async function POST(request:Request) {
  if (!(await isAdminSession(request)) || !sql) return NextResponse.json({error:'No autorizado'},{status:401});
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({error:'Configura el proveedor de correo primero'},{status:503});
  const rows=await sql`SELECT DISTINCT q.id,q.name,q.email,q.service_name,q.city,q.message FROM quote_requests q JOIN email_notifications n ON n.quote_id=q.id WHERE n.status IN ('pending','failed') LIMIT 5`;
  for(const row of rows) await notifyQuote(row as any);
  return NextResponse.json({ok:true});
}
