import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { authOptions } from "@/lib/auth";
import { hasPermission, type Permission } from "@/lib/rbac";

export async function requirePermission(permission: Permission, request?: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !hasPermission(session.user.role, permission)) {
    await appendAuditLog({
      action: "SECURITY_DENIED",
      actorId: session?.user?.id,
      actorEmail: session?.user?.email ?? undefined,
      role: session?.user?.role,
      ip: request?.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      userAgent: request?.headers.get("user-agent") ?? undefined,
      message: `Missing permission: ${permission}`
    });

    return {
      authorized: false as const,
      response: NextResponse.json({ ok: false, message: "Not authorized." }, { status: 403 })
    };
  }

  return {
    authorized: true as const,
    session
  };
}
