import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { sanitizeObject } from "@/lib/sanitize";
import { testimonialSchema } from "@/lib/testimonial-shared";
import { addTestimonial, getPublishedTestimonials, getTestimonials } from "@/lib/testimonials";
import { requirePermission } from "@/lib/server-auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeAll = url.searchParams.get("admin") === "true";

  if (includeAll) {
    const authorization = await requirePermission("cms:update", request);
    if (!authorization.authorized) return authorization.response;
    return NextResponse.json({ ok: true, testimonials: await getTestimonials(true) });
  }

  return NextResponse.json({ ok: true, testimonials: await getPublishedTestimonials() });
}

export async function POST(request: Request) {
  const authorization = await requirePermission("cms:update", request);
  if (!authorization.authorized) return authorization.response;

  const body = await request.json().catch(() => null);
  const result = testimonialSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const testimonial = await addTestimonial(sanitizeObject(result.data));
  await appendAuditLog({
    action: "TESTIMONIAL_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Testimonial",
    targetId: testimonial.id,
    message: `Testimonial created for ${testimonial.patientName}.`
  });

  return NextResponse.json({ ok: true, testimonial }, { status: 201 });
}
