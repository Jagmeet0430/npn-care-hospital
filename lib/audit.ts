import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "CMS_UPDATED"
  | "BLOG_CREATED"
  | "BLOG_UPDATED"
  | "BLOG_DELETED"
  | "MEDIA_UPLOADED"
  | "APPOINTMENT_UPDATED"
  | "APPOINTMENT_DELETED"
  | "AGREEMENT_SUBMITTED"
  | "AGREEMENT_UPDATED"
  | "AGREEMENT_APPROVED"
  | "AGREEMENT_DELETED"
  | "CAREER_APPLICATION_SUBMITTED"
  | "CAREER_APPLICATION_UPDATED"
  | "CAREER_APPLICATION_DELETED"
  | "AI_ASSISTANT_MESSAGE"
  | "AI_DOCUMENT_UPLOADED"
  | "TESTIMONIAL_UPDATED"
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
