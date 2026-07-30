import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCmsContent } from "@/lib/cms";

type GalleryImageRouteProps = {
  params: Promise<{ id: string }>;
};

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

export async function GET(_request: Request, { params }: GalleryImageRouteProps) {
  const { id } = await params;
  const content = await getCmsContent();
  const image = content.galleryImages.find((item) => item.id === id);

  if (!image) {
    return NextResponse.json({ ok: false, message: "Image not found." }, { status: 404 });
  }

  const extension = extensionByMimeType[image.mimeType];
  if (!extension) {
    return NextResponse.json({ ok: false, message: "Unsupported image type." }, { status: 415 });
  }

  const filePath = path.join(process.cwd(), "data", "uploads", "hospital", `${image.id}.${extension}`);
  const file = await readFile(filePath).catch(() => null);

  if (!file) {
    return NextResponse.json({ ok: false, message: "Image file not found." }, { status: 404 });
  }

  return new NextResponse(file, {
    headers: {
      "Content-Type": image.mimeType,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
