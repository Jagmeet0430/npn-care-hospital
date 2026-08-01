import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { appendAuditLog } from "@/lib/audit";
import { getCmsContent, saveCmsContent } from "@/lib/cms";
import type { HospitalGalleryImage } from "@/lib/gallery-shared";
import { requirePermission } from "@/lib/server-auth";

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"]
]);

const maxFileSize = 6 * 1024 * 1024;

function cleanText(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().replace(/\s+/g, " ");
  return cleaned || fallback;
}

export async function POST(request: Request) {
  const authorization = await requirePermission("media:upload", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ ok: false, message: "Invalid upload form." }, { status: 400 });
  }

  const file = formData.get("image");

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, message: "Image file is required." }, { status: 400 });
  }

  const extension = allowedTypes.get(file.type);
  if (!extension) {
    return NextResponse.json({ ok: false, message: "Only JPG, PNG, and WebP images are allowed." }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ ok: false, message: "Image must be 6MB or smaller." }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const filename = `${id}.${extension}`;
  const uploadDir = path.join(process.cwd(), "data", "uploads", "hospital");
  const destination = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());

  await mkdir(uploadDir, { recursive: true });
  await writeFile(destination, bytes);

  const image: HospitalGalleryImage = {
    id,
    title: cleanText(formData.get("title"), "Hospital Image"),
    alt: cleanText(formData.get("alt"), "N.P.N. Care Hospital image"),
    category: cleanText(formData.get("category"), ""),
    mimeType: file.type,
    src: `/api/gallery-images/${id}`,
    uploadedAt: new Date().toISOString()
  };

  const content = await getCmsContent();
  const nextContent = {
    ...content,
    galleryImages: [image, ...content.galleryImages]
  };

  const savedContent = await saveCmsContent(nextContent);
  await appendAuditLog({
    action: "MEDIA_UPLOADED",
    actorId: authorization.session.user.id,
    actorEmail: authorization.session.user.email ?? undefined,
    role: authorization.session.user.role,
    targetType: "HospitalGalleryImage",
    targetId: id,
    message: `Hospital image uploaded: ${image.title}`
  });
  return NextResponse.json({ ok: true, image, galleryImages: savedContent.galleryImages }, { status: 201 });
}
