import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { sanitizeObject } from "@/lib/sanitize";
import { testimonialUpdateSchema } from "@/lib/testimonial-shared";
import { deleteTestimonial, duplicateTestimonial, updateTestimonial } from "@/lib/testimonials";
import { requirePermission } from "@/lib/server-auth";

type TestimonialRouteProps = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: TestimonialRouteProps) {
  const authorization = await requirePermission("cms:update", request);
  if (!authorization.authorized) return authorization.response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const duplicate = body && typeof body === "object" && "action" in body && body.action === "duplicate";

  if (duplicate) {
    const testimonial = await duplicateTestimonial(id);
    if (!testimonial) return NextResponse.json({ ok: false, message: "Testimonial not found" }, { status: 404 });
    await appendAuditLog({
      action: "TESTIMONIAL_UPDATED",
      actorId: authorization.session.user.id,
      actorEmail: authorization.session.user.email ?? undefined,
      role: authorization.session.user.role,
      targetType: "Testimonial",
      targetId: testimonial.id,
      message: `Testimonial duplicated for ${testimonial.patientName}.`
    });
    return NextResponse.json({ ok: true, testimonial });
  }

  const result = testimonialUpdateSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const testimonial = await updateTestimonial(id, sanitizeObject(result.data));
  if (!testimonial) return NextResponse.json({ ok: false, message: "Testimonial not found" }, { status: 404 });

  await appendAuditLog({
    action: "TESTIMONIAL_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Testimonial",
    targetId: testimonial.id,
    message: `Testimonial updated for ${testimonial.patientName}.`
  });

  return NextResponse.json({ ok: true, testimonial });
}

export async function DELETE(request: Request, { params }: TestimonialRouteProps) {
  const authorization = await requirePermission("cms:update", request);
  if (!authorization.authorized) return authorization.response;

  const { id } = await params;
  const testimonial = await deleteTestimonial(id);
  if (!testimonial) return NextResponse.json({ ok: false, message: "Testimonial not found" }, { status: 404 });

  await appendAuditLog({
    action: "TESTIMONIAL_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Testimonial",
    targetId: testimonial.id,
    message: `Testimonial deleted for ${testimonial.patientName}.`
  });

  return NextResponse.json({ ok: true, testimonial });
}
