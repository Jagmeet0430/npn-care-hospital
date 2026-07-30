import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { getCmsContent, saveCmsContent, type CmsContent } from "@/lib/cms";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

export async function GET() {
  const content = await getCmsContent();
  return NextResponse.json(content);
}

export async function PUT(request: Request) {
  const authorization = await requirePermission("cms:update", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const body = (await request.json().catch(() => null)) as CmsContent | null;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ ok: false, message: "Invalid CMS payload" }, { status: 400 });
  }

  const content = await saveCmsContent(sanitizeObject(body));
  await appendAuditLog({
    action: "CMS_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "CMS",
    message: "CMS content updated."
  });
  return NextResponse.json({ ok: true, content });
}
