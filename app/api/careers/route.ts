import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { addCareerApplication, careerUploadRoot, getCareerApplications } from "@/lib/careers";
import { getCmsContent } from "@/lib/cms";
import { queueEmailNotification } from "@/lib/email-notifications";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

const maxResumeSize = 5 * 1024 * 1024;
const allowedResumeTypes = new Map([
  ["application/pdf", ".pdf"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"]
]);
const allowedPhotoTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

const applicationSchema = z.object({
  fullName: z.string().min(2).max(120),
  parentName: z.string().min(2).max(120),
  email: z.string().email().max(160),
  mobile: z.string().min(10).max(24),
  address: z.string().min(5).max(260),
  city: z.string().min(2).max(90),
  state: z.string().min(2).max(90),
  pincode: z.string().min(4).max(12),
  dateOfBirth: z.string().min(1).max(40),
  gender: z.string().min(1).max(40),
  qualification: z.string().min(2).max(140),
  experience: z.string().min(1).max(120),
  position: z.string().min(2).max(140),
  expectedSalary: z.string().max(80).optional(),
  message: z.string().max(800).optional(),
  declarationAccepted: z.literal("true")
});

function value(formData: FormData, key: string) {
  const entry = formData.get(key);
  return typeof entry === "string" ? entry.trim() : "";
}

async function storeFile(file: File, allowedTypes: Map<string, string>, maxSize: number) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Invalid file type.");
  }

  if (file.size > maxSize) {
    throw new Error("File size is too large.");
  }

  await mkdir(careerUploadRoot, { recursive: true });
  const extension = allowedTypes.get(file.type) ?? path.extname(file.name).toLowerCase();
  const storageName = `${crypto.randomUUID()}${extension}`;
  await writeFile(path.join(careerUploadRoot, storageName), Buffer.from(await file.arrayBuffer()));

  return {
    originalName: file.name,
    storageName,
    mimeType: file.type,
    size: file.size
  };
}

export async function GET(request: Request) {
  const authorization = await requirePermission("careers:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const applications = await getCareerApplications();
  return NextResponse.json({ ok: true, applications });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rateLimit = checkRateLimit(`career:${ip}`, 6, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json({ ok: false, message: "Too many applications. Please try again later." }, { status: 429 });
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, message: "Invalid application form." }, { status: 400 });
  }

  const parsed = applicationSchema.safeParse({
    fullName: value(formData, "fullName"),
    parentName: value(formData, "parentName"),
    email: value(formData, "email"),
    mobile: value(formData, "mobile"),
    address: value(formData, "address"),
    city: value(formData, "city"),
    state: value(formData, "state"),
    pincode: value(formData, "pincode"),
    dateOfBirth: value(formData, "dateOfBirth"),
    gender: value(formData, "gender"),
    qualification: value(formData, "qualification"),
    experience: value(formData, "experience"),
    position: value(formData, "position"),
    expectedSalary: value(formData, "expectedSalary"),
    message: value(formData, "message"),
    declarationAccepted: value(formData, "declarationAccepted")
  });

  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const resume = formData.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return NextResponse.json({ ok: false, message: "Resume is required." }, { status: 400 });
  }

  const photo = formData.get("photo");

  try {
    const storedResume = await storeFile(resume, allowedResumeTypes, maxResumeSize);
    const storedPhoto = photo instanceof File && photo.size > 0 ? await storeFile(photo, allowedPhotoTypes, 2 * 1024 * 1024) : undefined;
    const cleaned = sanitizeObject(parsed.data);
    const application = await addCareerApplication({
      ...cleaned,
      declarationAccepted: true,
      resume: storedResume,
      photo: storedPhoto
    });

    const { hospital } = await getCmsContent();

    await Promise.all([
      queueEmailNotification({
        to: application.email,
        subject: `Application received - ${application.applicationId}`,
        body: `Thank you ${application.fullName}. Your application for ${application.position} has been received. Application ID: ${application.applicationId}.`
      }),
      queueEmailNotification({
        to: hospital.email,
        subject: `New job application - ${application.position}`,
        body: `${application.fullName} submitted a job application. Application ID: ${application.applicationId}.`
      }),
      appendAuditLog({
        action: "CAREER_APPLICATION_SUBMITTED",
        targetType: "CareerApplication",
        targetId: application.applicationId,
        ip,
        userAgent: request.headers.get("user-agent") ?? undefined,
        message: `Career application submitted by ${application.fullName}.`
      })
    ]);

    return NextResponse.json({
      ok: true,
      application: {
        applicationId: application.applicationId,
        submittedAt: application.submittedAt,
        status: application.status
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, message: error instanceof Error ? error.message : "Could not submit application." }, { status: 400 });
  }
}
