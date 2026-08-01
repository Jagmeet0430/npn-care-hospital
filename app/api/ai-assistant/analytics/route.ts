import { NextResponse } from "next/server";
import { getAssistantAnalytics } from "@/lib/ai-assistant";
import { requirePermission } from "@/lib/server-auth";

export async function GET(request: Request) {
  const authorization = await requirePermission("ai:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const analytics = await getAssistantAnalytics();
  return NextResponse.json({ ok: true, analytics });
}
