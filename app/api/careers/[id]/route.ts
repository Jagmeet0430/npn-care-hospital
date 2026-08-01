import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { careerStatusValues } from "@/lib/career-shared";
import { deleteCareerApplication, updateCareerApplication } from "@/lib/careers";
import { requirePermission } from "@/lib/server-auth";

type CareerRouteProps = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  status: z.enum(careerStatusValues).optional(),
  note: z.string().max(500).optional()
});

export async function PATCH(request: Request, { params }: CareerRouteProps) {
  const authorization = await requirePermission("careers:update", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const application = await updateCareerApplication(id, parsed.data);
  if (!application) {
    return NextResponse.json({ ok: false, message: "Application not found." }, { status: 404 });
  }

  await appendAuditLog({
    action: "CAREER_APPLICATION_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "CareerApplication",
    targetId: application.applicationId,
    message: `Career application updated to ${application.status}.`
  });

  return NextResponse.json({ ok: true, application });
}

export async function DELETE(request: Request, { params }: CareerRouteProps) {
  const authorization = await requirePermission("careers:delete", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;
  const application = await deleteCareerApplication(id);
  if (!application) {
    return NextResponse.json({ ok: false, message: "Application not found." }, { status: 404 });
  }

  await appendAuditLog({
    action: "CAREER_APPLICATION_DELETED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "CareerApplication",
    targetId: application.applicationId,
    message: `Career application deleted for ${application.fullName}.`
  });

  return NextResponse.json({ ok: true, application });
}
