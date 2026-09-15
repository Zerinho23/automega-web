const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64");
}

export function createSalt() {
  return toBase64(crypto.getRandomValues(new Uint8Array(16)));
}

export async function hashPassword(password: string, salt: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(salt, "base64"), iterations: 210_000 }, key, 256);
  return toBase64(new Uint8Array(bits));
}

export async function verifyPassword(password: string, salt: string, expected: string) {
  const actual = await hashPassword(password, salt);
  if (actual.length !== expected.length) return false;
  let difference = 0;
  for (let index = 0; index < actual.length; index += 1) difference |= actual.charCodeAt(index) ^ expected.charCodeAt(index);
  return difference === 0;
}
