import { NextResponse } from "next/server";
import {
  addAgreement,
  agreementSchema,
  getAgreements,
} from "@/lib/agreements";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeObject } from "@/lib/sanitize";
import { requirePermission } from "@/lib/server-auth";

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

    return NextResponse.json({
      ok: true,
      agreements,
    });
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
    // ----------------------------------------
    // Rate limiting
    // ----------------------------------------
    const ip =
      request.headers
        .get("x-forwarded-for")
        ?.split(",")[0]
        ?.trim() ?? "local";

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

    // ----------------------------------------
    // Read body
    // ----------------------------------------
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

    // ----------------------------------------
    // DEBUG - check what actually arrives
    // ----------------------------------------
    console.log("========== AGREEMENT API BODY ==========");
    console.log("patientId:", body.patientId);
    console.log(
      "patient.address:",
      JSON.stringify(body.patient?.address)
    );
    console.log(
      "patient.address length:",
      typeof body.patient?.address === "string"
        ? body.patient.address.trim().length
        : "NOT A STRING"
    );
    console.log("========================================");

    // ----------------------------------------
    // Normalize patient information
    // ----------------------------------------
    const patient = {
      ...(body.patient ?? {}),
      fullName: String(body.patient?.fullName ?? "").trim(),
      guardianName: String(
        body.patient?.guardianName ?? ""
      ).trim(),
      gender: String(body.patient?.gender ?? "").trim(),
      dob: String(body.patient?.dob ?? "").trim(),
      age: Number(body.patient?.age ?? 0),
      mobile: String(body.patient?.mobile ?? "").trim(),
      email: String(body.patient?.email ?? "").trim(),
      address: String(body.patient?.address ?? "").trim(),
      city: String(body.patient?.city ?? "").trim(),
      state: String(body.patient?.state ?? "").trim(),
      pinCode: String(body.patient?.pinCode ?? "").trim(),
    };

    // ----------------------------------------
    // IMPORTANT
    // ----------------------------------------
    // Do NOT allow an empty/short address to
    // silently enter Supabase.
    //
    // Show the real validation error.
    // ----------------------------------------
    if (patient.address.length < 5) {
      console.error(
        "AGREEMENT ADDRESS ERROR:",
        JSON.stringify(patient.address)
      );

      return NextResponse.json(
        {
          ok: false,
          message:
            "Patient address must contain at least 5 characters.",
          errors: {
            patient: {
              address:
                "Patient address must contain at least 5 characters.",
            },
          },
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Build normalized payload
    // ----------------------------------------
    const normalizedBody = {
      ...body,
      patient,
    };

    console.log(
      "NORMALIZED ADDRESS:",
      JSON.stringify(normalizedBody.patient.address)
    );

    // ----------------------------------------
    // Zod validation
    // ----------------------------------------
    const result =
      agreementSchema.safeParse(normalizedBody);

    if (!result.success) {
      console.error(
        "Agreement validation failed:",
        result.error.flatten()
      );

      return NextResponse.json(
        {
          ok: false,
          message:
            "Please correct the agreement information.",
          errors: result.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // ----------------------------------------
    // Sanitize
    // ----------------------------------------
    const cleanAgreement =
      sanitizeObject(result.data);

    // ----------------------------------------
    // Save in Supabase
    // ----------------------------------------
    const agreement =
      await addAgreement(cleanAgreement);

    console.log(
      "AGREEMENT SAVED:",
      agreement.agreementNo
    );

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

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to save agreement.",
      },
      { status: 500 }
    );
  }
}