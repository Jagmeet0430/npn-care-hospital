import { NextResponse } from "next/server";
import { z } from "zod";
import { addAppointment, getAppointments } from "@/lib/appointments";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

const appointmentSchema = z.object({
  name: z.string().min(2).max(120),
  age: z.coerce.number().min(1).max(120),
  gender: z.string().min(1).max(40),
  phone: z.string().min(10).max(24),
  email: z.string().email().optional().or(z.literal("")),
  treatment: z.string().min(1).max(120),
  doctor: z.string().min(1).max(120),
  date: z.string().min(1).max(40),
  time: z.string().min(1).max(40)
});

export async function GET(request: Request) {
  const authorization = await requirePermission("appointments:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const appointments = await getAppointments();
  return NextResponse.json({ ok: true, appointments });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rateLimit = checkRateLimit(`appointment:${ip}`, 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many appointment requests. Please try again later." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const result = appointmentSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ ok: false, errors: result.error.flatten().fieldErrors }, { status: 400 });
  }

  const appointment = await addAppointment(sanitizeObject(result.data));
  return NextResponse.json({ ok: true, appointment });
}
