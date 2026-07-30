import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CMS_UPDATED"
  | "MEDIA_UPLOADED"
  | "APPOINTMENT_UPDATED"
  | "AGREEMENT_SUBMITTED"
  | "AGREEMENT_UPDATED"
  | "AGREEMENT_APPROVED"
  | "SECURITY_DENIED";

export type AuditLogEntry = {
  id: string;
  action: AuditAction;
  actorId?: string;
  actorEmail?: string;
  role?: string;
  targetType?: string;
  targetId?: string;
  ip?: string;
  userAgent?: string;
  message: string;
  at: string;
};

const auditPath = path.join(process.cwd(), "data", "audit-log.json");

async function readAuditLog() {
  try {
    const raw = await readFile(auditPath, "utf8");
    return JSON.parse(raw) as AuditLogEntry[];
  } catch {
    return [];
  }
}

export async function appendAuditLog(entry: Omit<AuditLogEntry, "id" | "at">) {
  const logs = await readAuditLog();
  const nextEntry: AuditLogEntry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    ...entry
  };

  await mkdir(path.dirname(auditPath), { recursive: true });
  await writeFile(auditPath, `${JSON.stringify([nextEntry, ...logs].slice(0, 5000), null, 2)}\n`, "utf8");
  return nextEntry;
}

export async function getAuditLogs() {
  return readAuditLog();
}
