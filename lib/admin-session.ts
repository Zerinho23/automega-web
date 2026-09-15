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
  const secret = sessionSecret();
  if (!secret) return false;
  const cookie = request.headers.get("cookie") || "";
  const token = cookie.match(/(?:^|;\s*)automega_admin_session=([^;]+)/)?.[1];
  if (!token) return false;
  const [expires, suppliedSignature] = token.split(".");
  if (!expires || !suppliedSignature || Number(expires) < Date.now()) return false;
  return suppliedSignature === await signature(expires, secret);
}
