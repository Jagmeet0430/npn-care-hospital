import { NextResponse } from "next/server";
import { addAgreement, agreementSchema, getAgreements } from "@/lib/agreements";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

export async function GET(request: Request) {
  const authorization = await requirePermission("agreements:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const agreements = await getAgreements();
  return NextResponse.json({ ok: true, agreements });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rateLimit = checkRateLimit(`agreement:${ip}`, 6, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many agreement submissions. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const result = agreementSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const agreement = await addAgreement(sanitizeObject(result.data));
  return NextResponse.json({ ok: true, agreement }, { status: 201 });
}
