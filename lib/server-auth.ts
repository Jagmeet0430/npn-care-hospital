import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { appendAuditLog } from "@/lib/audit";
import { hasPermission, type Permission, type Role } from "@/lib/rbac";

export async function requirePermission(
  permission: Permission,
  request?: Request
) {
  const supabase = await createSupabaseServerClient();

  // Get the currently authenticated Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No authenticated user
  if (!user) {
    await appendAuditLog({
      action: "SECURITY_DENIED",
      actorId: undefined,
      actorEmail: undefined,
      role: undefined,
      ip: request?.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim(),
      userAgent: request?.headers.get("user-agent") ?? undefined,
      message: `Unauthenticated request. Missing permission: ${permission}`,
    });

    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      ),
    };
  }

  // Find the user's admin record
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select("id, name, email, role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  // Admin record doesn't exist
  if (error || !admin) {
    await appendAuditLog({
      action: "SECURITY_DENIED",
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      role: undefined,
      ip: request?.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim(),
      userAgent: request?.headers.get("user-agent") ?? undefined,
      message: `Admin record not found. Missing permission: ${permission}`,
    });

    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: "Admin account not found.",
        },
        { status: 403 }
      ),
    };
  }

  // Account disabled
  if (!admin.is_active) {
    await appendAuditLog({
      action: "SECURITY_DENIED",
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      role: admin.role as Role,
      ip: request?.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim(),
      userAgent: request?.headers.get("user-agent") ?? undefined,
      message: "Admin account is disabled.",
    });

    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: "Admin account is disabled.",
        },
        { status: 403 }
      ),
    };
  }

  const role = admin.role as Role;

  // Check RBAC permission
  if (!hasPermission(role, permission)) {
    await appendAuditLog({
      action: "SECURITY_DENIED",
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      role,
      ip: request?.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim(),
      userAgent: request?.headers.get("user-agent") ?? undefined,
      message: `Missing permission: ${permission}`,
    });

    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          ok: false,
          message: "Not authorized.",
        },
        { status: 403 }
      ),
    };
  }

  // Authorized
  return {
    authorized: true as const,
    session: {
      user: {
        id: user.id,
        email: user.email ?? admin.email ?? null,
        name: admin.name ?? null,
        role,
      },
    },
  };
}