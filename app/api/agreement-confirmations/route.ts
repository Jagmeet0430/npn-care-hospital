import { NextResponse } from "next/server";

import {
  addAgreement,
  agreementSchema,
  getAgreements,
} from "@/lib/agreements";

import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authorization = await requirePermission(
      "agreements:read",
      request
    );

    if (!authorization.authorized) {
      return authorization.response;
    }

    const agreements = await getAgreements();

    return NextResponse.json(
      {
        ok: true,
        agreements,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/agreements error:", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Unable to load agreements.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // -----------------------------------------
    // Rate limiting
    // -----------------------------------------

    const ip =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() || "local";

    const rateLimit = checkRateLimit(
      `agreement:${ip}`,
      6,
      60 * 60 * 1000
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Too many agreement submissions. Please try again later.",
        },
        { status: 429 }
      );
    }

    // -----------------------------------------
    // Read body
    // -----------------------------------------

    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    console.log("========== AGREEMENT API BODY ==========");
    console.log("patientId:", body.patientId);
    console.log("patient:", body.patient);
    console.log("medical:", body.medical);
    console.log("treatment:", body.treatment);
    console.log("documents:", body.documents?.length);
    console.log("confirmations:", body.confirmations);
    console.log("signature:", {
      mode: body.signature?.mode,
      hasValue: Boolean(body.signature?.value),
    });
    console.log("========================================");

    // -----------------------------------------
    // Validate
    // -----------------------------------------

    const result = agreementSchema.safeParse(body);

    if (!result.success) {
      const validationErrors =
        result.error.flatten().fieldErrors;

      console.error(
        "Agreement validation failed:",
        validationErrors
      );

      return NextResponse.json(
        {
          ok: false,
          message:
            "Please correct the agreement information.",
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // Sanitize
    // -----------------------------------------

    const cleanAgreement = sanitizeObject(result.data);

    console.log(
      "Agreement validation successful."
    );

    // -----------------------------------------
    // Save to Supabase
    // -----------------------------------------

    const agreement = await addAgreement(
      cleanAgreement
    );

    console.log(
      "Agreement successfully saved:",
      agreement.agreementNo
    );

    // -----------------------------------------
    // Success
    // -----------------------------------------

    return NextResponse.json(
      {
        ok: true,
        agreement,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/agreements error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unable to save agreement.";

    return NextResponse.json(
      {
        ok: false,
        message,
      },
      { status: 500 }
    );
  }
}