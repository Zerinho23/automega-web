const encoder = new TextEncoder();

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function createAdminSession() {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET no está configurado");
  const expires = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expires}.${await signature(expires, secret)}`;
}

export async function isAdminSession(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return false;
  const secret = sessionSecret();
  if (!secret) return false;
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.match(/(?:^|;\s*)automega_admin_session=([^;]+)/)?.[1];
  if (!token) return false;
  if (!/^\d{13}\.[a-f0-9]{64}$/.test(token)) return false;
  const [expires, suppliedSignature] = token.split(".");
  if (!/^\d+$/.test(expires || '') || !/^[a-f0-9]{64}$/.test(suppliedSignature || '') || Number(expires) < Date.now()) return false;
  if (Number(expires) > Date.now() + 8 * 60 * 60 * 1000) return false;
  const expected = await signature(expires, secret);
  let difference = 0;
  for (let index = 0; index < expected.length; index++) difference |= suppliedSignature.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
