import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { reorderTestimonials } from "@/lib/testimonials";
import { requirePermission } from "@/lib/server-auth";

const reorderSchema = z.object({
  order: z.array(z.object({ id: z.string().min(1), displayOrder: z.coerce.number().int().min(0) }))
});

export async function POST(request: Request) {
  const authorization = await requirePermission("cms:update", request);
  if (!authorization.authorized) return authorization.response;

  const body = await request.json().catch(() => null);
  const result = reorderSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const testimonials = await reorderTestimonials(result.data.order);
  await appendAuditLog({
    action: "TESTIMONIAL_UPDATED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "Testimonial",
    message: "Testimonials reordered."
  });

  return NextResponse.json({ ok: true, testimonials });
}
