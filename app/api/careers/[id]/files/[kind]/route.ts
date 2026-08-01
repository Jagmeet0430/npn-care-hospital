import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { getCareerApplications, getCareerFilePath } from "@/lib/careers";
import { requirePermission } from "@/lib/server-auth";

type CareerFileRouteProps = {
  params: Promise<{ id: string; kind: string }>;
};

export async function GET(request: Request, { params }: CareerFileRouteProps) {
  const authorization = await requirePermission("careers:read", request);
  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id, kind } = await params;
  const applications = await getCareerApplications();
  const application = applications.find((item) => item.id === id || item.applicationId === id);
  if (!application) {
    return NextResponse.json({ ok: false, message: "Application not found." }, { status: 404 });
  }

  const file = kind === "photo" ? application.photo : application.resume;
  if (!file) {
    return NextResponse.json({ ok: false, message: "File not found." }, { status: 404 });
  }

  const buffer = await readFile(getCareerFilePath(file));
  const disposition = kind === "resume" ? "inline" : "inline";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.size),
      "Content-Disposition": `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store"
    }
  });
}
