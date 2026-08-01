import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import {
  aiUploadRoot,
  createAssistantAppointment,
  createAssistantMessage,
  detectAssistantLanguage,
  generateApprovedAssistantAnswer,
  getAssistantConversations,
  saveAssistantConversation,
  type AssistantAppointmentInput
} from "@/lib/ai-assistant";
import { assistantLanguages } from "@/lib/ai-assistant-shared";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

const chatSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1).max(1200),
  language: z.enum(assistantLanguages).default("auto"),
  appointment: z
    .object({
      name: z.string().min(2).max(120),
      phone: z.string().min(10).max(24),
      department: z.string().min(2).max(140),
      preferredDoctor: z.string().max(140).optional(),
      preferredDate: z.string().min(1).max(40),
      preferredTime: z.string().max(40).optional()
    })
    .optional()
});

const allowedReportTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

async function storeAssistantAttachment(file: File) {
  if (!allowedReportTypes.has(file.type)) {
    throw new Error("Only PDF, JPG, PNG, or WEBP medical uploads are accepted.");
  }

  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Medical upload must be 8 MB or smaller.");
  }

  await mkdir(aiUploadRoot, { recursive: true });
  const extension = path.extname(file.name) || (file.type === "application/pdf" ? ".pdf" : ".bin");
  const storageName = `${crypto.randomUUID()}${extension}`;
  await writeFile(path.join(aiUploadRoot, storageName), Buffer.from(await file.arrayBuffer()));
  return {
    fileName: file.name,
    storageName,
    mimeType: file.type,
    size: file.size
  };
}

async function parseRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("attachment");
    const appointmentRaw = formData.get("appointment");
    return {
      payload: {
        conversationId: String(formData.get("conversationId") ?? "") || undefined,
        message: String(formData.get("message") ?? ""),
        language: String(formData.get("language") ?? "auto"),
        appointment: typeof appointmentRaw === "string" && appointmentRaw ? JSON.parse(appointmentRaw) : undefined
      },
      attachment: file instanceof File && file.size > 0 ? file : undefined
    };
  }

  return {
    payload: await request.json().catch(() => null),
    attachment: undefined
  };
}

export async function GET(request: Request) {
  const authorization = await requirePermission("ai:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const conversations = await getAssistantConversations();
  return NextResponse.json({ ok: true, conversations });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rateLimit = checkRateLimit(`ai:${ip}`, 40, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many assistant messages. Please try again later." }, { status: 429 });
  }

  try {
    const parsedRequest = await parseRequest(request);
    const result = chatSchema.safeParse(parsedRequest.payload);
    if (!result.success) {
      return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
    }

    const data = sanitizeObject(result.data);
    const language = detectAssistantLanguage(data.message, data.language);
    const storedAttachment = parsedRequest.attachment ? await storeAssistantAttachment(parsedRequest.attachment) : undefined;
    const answer = await generateApprovedAssistantAnswer({
      message: data.message,
      language,
      attachmentName: storedAttachment?.fileName
    });

    let appointmentMessage = "";
    if (data.appointment) {
      const appointment = await createAssistantAppointment(data.appointment as AssistantAppointmentInput);
      appointmentMessage = `\n\nAppointment request saved. Reference: ${appointment.id}. The care desk will confirm by phone.`;
    }

    const conversations = await getAssistantConversations();
    const conversation =
      conversations.find((item) => item.id === data.conversationId) ?? {
        id: crypto.randomUUID(),
        language,
        messages: [],
        escalationRequested: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

    const userMessage = createAssistantMessage("user", storedAttachment ? `${data.message}\nUploaded file: ${storedAttachment.fileName}` : data.message);
    const assistantMessage = createAssistantMessage("assistant", `${answer.content}${appointmentMessage}`, {
      links: answer.links,
      disclaimer: answer.disclaimer
    });

    conversation.language = language;
    conversation.messages = [...conversation.messages, userMessage, assistantMessage];
    conversation.escalationRequested = conversation.escalationRequested || (answer.escalationSuggested ?? false);
    conversation.updatedAt = new Date().toISOString();
    await saveAssistantConversation(conversation);

    await appendAuditLog({
      action: "AI_ASSISTANT_MESSAGE",
      targetType: "AssistantConversation",
      targetId: conversation.id,
      ip,
      userAgent: request.headers.get("user-agent") ?? undefined,
      message: "AI assistant answered from approved content."
    });

    return NextResponse.json({
      ok: true,
      conversationId: conversation.id,
      language,
      message: assistantMessage,
      escalationSuggested: answer.escalationSuggested ?? false
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Assistant could not respond." }, { status: 400 });
  }
}
