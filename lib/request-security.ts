import { createHash } from 'node:crypto';
import { sql } from '@/lib/neon';

export function sameOrigin(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  return !origin || origin === new URL(request.url).origin;
}

export async function readObject(request: Request, maximum = 32_000): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length') || 0) > maximum) throw new Error('Datos demasiado grandes');
  const raw = await request.text();
  if (Buffer.byteLength(raw, 'utf8') > maximum) throw new Error('Datos demasiado grandes');
  const value: unknown = JSON.parse(raw);
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Datos inválidos');
  return value as Record<string, unknown>;
}

export async function allowRequest(request: Request, scope: string, maximum: number, minutes: number) {
  if (!sql) return false;
  const ip = request.headers.get('x-vercel-forwarded-for') || request.headers.get('x-forwarded-for') || 'unknown';
  const key = createHash('sha256').update(`${scope}:${ip.split(',')[0].trim()}`).digest('hex');
  const rows = await sql`INSERT INTO request_limits (key,count,expires_at) VALUES (${key},1,now()+${minutes}*interval '1 minute') ON CONFLICT (key) DO UPDATE SET count=CASE WHEN request_limits.expires_at < now() THEN 1 ELSE request_limits.count+1 END,expires_at=CASE WHEN request_limits.expires_at < now() THEN now()+${minutes}*interval '1 minute' ELSE request_limits.expires_at END RETURNING count`;
  return Number(rows[0].count) <= maximum;
}
