import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

type EncryptedPayload = {
  encrypted: true;
  algorithm: "aes-256-gcm";
  iv: string;
  tag: string;
  payload: string;
};

export function getEncryptionKey() {
  const secret = process.env.DATA_ENCRYPTION_KEY ?? process.env.NEXTAUTH_SECRET ?? "npn-local-development-encryption-key";
  return createHash("sha256").update(secret).digest();
}

export function encryptJson<T>(data: T): EncryptedPayload {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);

  return {
    encrypted: true,
    algorithm: "aes-256-gcm",
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    payload: encrypted.toString("base64")
  };
}

export function decryptJson<T>(payload: EncryptedPayload): T {
  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(payload.iv, "base64"));
  decipher.setAuthTag(Buffer.from(payload.tag, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(payload.payload, "base64")), decipher.final()]);
  return JSON.parse(decrypted.toString("utf8")) as T;
}

export function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  return Boolean(value && typeof value === "object" && "encrypted" in value && (value as { encrypted?: unknown }).encrypted === true);
}
