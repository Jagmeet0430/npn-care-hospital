import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { addAssistantDocument, aiUploadRoot, getAssistantDocuments } from "@/lib/ai-assistant";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

const documentSchema = z.object({
  title: z.string().min(2).max(160),
  source: z.string().min(2).max(160),
  text: z.string().min(10).max(8000)
});

const allowedTypes = new Set(["application/pdf", "text/plain"]);

async function storeKnowledgeFile(file: File) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Only PDF or TXT knowledge files are accepted.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Knowledge file must be 10 MB or smaller.");
  }

  await mkdir(aiUploadRoot, { recursive: true });
  const storageName = `${crypto.randomUUID()}${path.extname(file.name) || ".dat"}`;
  await writeFile(path.join(aiUploadRoot, storageName), Buffer.from(await file.arrayBuffer()));
  return { fileName: file.name, mimeType: file.type, storageName };
}

export async function GET(request: Request) {
  const authorization = await requirePermission("ai:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const documents = await getAssistantDocuments();
  return NextResponse.json({ ok: true, documents });
}

export async function POST(request: Request) {
  const authorization = await requirePermission("ai:update", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, message: "Invalid document upload." }, { status: 400 });
  }

  const parsed = documentSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    source: String(formData.get("source") ?? ""),
    text: String(formData.get("text") ?? "")
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const file = formData.get("file");
  const stored = file instanceof File && file.size > 0 ? await storeKnowledgeFile(file) : undefined;
  const document = await addAssistantDocument({
    ...sanitizeObject(parsed.data),
    ...stored
  });

  await appendAuditLog({
    action: "AI_DOCUMENT_UPLOADED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "AssistantDocument",
    targetId: document.id,
    message: `AI knowledge document uploaded: ${document.title}.`
  });

  return NextResponse.json({ ok: true, document });
}
