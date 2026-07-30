import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getAgreementById } from "@/lib/agreements";

type AgreementQrRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: AgreementQrRouteProps) {
  const { id } = await params;
  const agreement = await getAgreementById(id);

  if (!agreement) {
    return NextResponse.json({ ok: false, message: "Agreement not found." }, { status: 404 });
  }

  const svg = await QRCode.toString(agreement.verificationUrl, {
    type: "svg",
    margin: 1,
    width: 220,
    errorCorrectionLevel: "M"
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff"
    }
  });
}
