import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { agreementStatusValues } from "@/lib/agreement-shared";
import { getAgreementById, updateAgreement } from "@/lib/agreements";
import { requirePermission } from "@/lib/server-auth";

type AgreementRouteProps = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  status: z.enum(agreementStatusValues).optional(),
  note: z.string().max(800).optional(),
  assignedDoctor: z.string().max(120).optional(),
  assignedDepartment: z.string().max(120).optional(),
  actor: z.string().max(80).optional()
});

export async function GET(request: Request, { params }: AgreementRouteProps) {
  const authorization = await requirePermission("agreements:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;
  const agreement = await getAgreementById(id);

  if (!agreement) {
    return NextResponse.json({ ok: false, message: "Agreement not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, agreement });
}

export async function PATCH(request: Request, { params }: AgreementRouteProps) {
  const authorization = await requirePermission("agreements:update", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = updateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const agreement = await updateAgreement(id, result.data);

  if (!agreement) {
    return NextResponse.json({ ok: false, message: "Agreement not found" }, { status: 404 });
  }

  await appendAuditLog({
    action: agreement.status === "Approved" ? "AGREEMENT_APPROVED" : "AGREEMENT_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Agreement",
    targetId: agreement.agreementNo,
    message: `Agreement ${agreement.agreementNo} updated to ${agreement.status}.`
  });

  return NextResponse.json({ ok: true, agreement });
}
