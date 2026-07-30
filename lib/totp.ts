import { createHmac } from "node:crypto";

const base32Alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function decodeBase32(secret: string) {
  const cleaned = secret.replace(/=+$/, "").replace(/\s+/g, "").toUpperCase();
  let bits = "";

  for (const char of cleaned) {
    const value = base32Alphabet.indexOf(char);
    if (value === -1) continue;
    bits += value.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }

  return Buffer.from(bytes);
}

function generateTotp(secret: string, step: number) {
  const key = decodeBase32(secret);
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(step));
  const hmac = createHmac("sha1", key).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    (((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff)) %
    1_000_000;

  return code.toString().padStart(6, "0");
}

export function verifyTotp(secret: string | null | undefined, token: string | null | undefined) {
  if (!secret) return true;
  if (!token || !/^\d{6}$/.test(token)) return false;

  const currentStep = Math.floor(Date.now() / 30_000);
  return [-1, 0, 1].some((offset) => generateTotp(secret, currentStep + offset) === token);
}
