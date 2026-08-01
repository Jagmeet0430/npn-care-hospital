import { NextResponse } from "next/server";
import { z } from "zod";
import { appointmentStatusValues } from "@/lib/appointment-shared";
import { appendAuditLog } from "@/lib/audit";
import { deleteAppointment, updateAppointment } from "@/lib/appointments";
import { requirePermission } from "@/lib/server-auth";

type AppointmentRouteProps = {
  params: Promise<{ id: string }>;
};

const updateSchema = z.object({
  status: z.enum(appointmentStatusValues).optional(),
  doctor: z.string().min(1).max(120).optional(),
  date: z.string().min(1).max(40).optional(),
  time: z.string().min(1).max(40).optional()
});

export async function PATCH(request: Request, { params }: AppointmentRouteProps) {
  const authorization = await requirePermission("appointments:update", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const result = updateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const appointment = await updateAppointment(id, result.data);

  if (!appointment) {
    return NextResponse.json({ ok: false, message: "Appointment not found" }, { status: 404 });
  }

  await appendAuditLog({
    action: "APPOINTMENT_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Appointment",
    targetId: appointment.id,
    message: `Appointment updated for ${appointment.name}.`
  });

  return NextResponse.json({ ok: true, appointment });
}

export async function DELETE(request: Request, { params }: AppointmentRouteProps) {
  const authorization = await requirePermission("appointments:delete", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await params;
  const appointment = await deleteAppointment(id);

  if (!appointment) {
    return NextResponse.json({ ok: false, message: "Appointment not found" }, { status: 404 });
  }

  await appendAuditLog({
    action: "APPOINTMENT_DELETED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Appointment",
    targetId: appointment.id,
    message: `Appointment deleted for ${appointment.name}.`
  });

  return NextResponse.json({ ok: true, appointment });
}
