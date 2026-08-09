import { unstable_noStore as noStore } from "next/cache";

import { z } from "zod";

import { appendAuditLog } from "@/lib/audit";

import {
  agreementDocumentSchema,
  type AgreementDocument,
  type AgreementStatus,
} from "@/lib/agreement-shared";

import { supabaseAdmin } from "@/lib/supabase/admin";

/* =========================================================
   AGREEMENT VALIDATION SCHEMA
========================================================= */

export const agreementSchema = z.object({
  /*
   * Existing patient created during Step 0.
   */
  patientId: z.string().uuid(),

  /* =======================================================
     PATIENT INFORMATION
  ======================================================= */

  patient: z.object({
  fullName: z.string().trim().min(2).max(120),
  guardianName: z.string().trim().min(2).max(120),
  gender: z.string().trim().min(1).max(40),
  dob: z.string().trim().min(1).max(40),
  age: z.coerce.number().min(1).max(120),

  mobile: z
    .string()
    .trim()
    .min(10)
    .max(24),

  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .min(5, "Address must contain at least 5 characters")
    .max(240),

  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pinCode: z.string().trim().min(4).max(12),
}),

  /* =======================================================
     MEDICAL INFORMATION
  ======================================================= */

  medical: z.object({
    disease: z.string().min(2).max(160),

    symptoms: z.string().min(2).max(600),

    duration: z.string().min(1).max(80),

    previousTreatment: z
      .string()
      .min(1)
      .max(500),

    currentMedicines: z
      .string()
      .min(1)
      .max(500),

    medicalHistory: z
      .string()
      .min(1)
      .max(500),

    allergies: z
      .string()
      .min(1)
      .max(300),

    doctorPreference: z
      .string()
      .min(1)
      .max(120),
  }),

  /* =======================================================
     TREATMENT INFORMATION
  ======================================================= */

  treatment: z.object({
    courseDuration: z
      .string()
      .min(1)
      .max(120),

    recommendedTherapy: z
      .string()
      .min(2)
      .max(180),

    assignedDoctor: z
      .string()
      .min(1)
      .max(120),

    hospitalBranch: z
      .string()
      .min(2)
      .max(160),
  }),

  /* =======================================================
     DOCUMENTS
  ======================================================= */

  documents: z
    .array(agreementDocumentSchema)
    .min(1),

  /* =======================================================
     DIGITAL AGREEMENT
  ======================================================= */

  confirmations: z.object({
    declaration: z.boolean(),

    treatmentConsent: z.boolean(),

    privacyPolicy: z.boolean(),

    medicalConfirmation: z.boolean(),

    responsibilities: z.boolean(),

    importantNotes: z.boolean(),

    finalConsent: z.boolean(),
  }),

  /* =======================================================
     DIGITAL SIGNATURE
  ======================================================= */

  signature: z.object({
    mode: z.enum([
      "draw",
      "type",
      "upload",
    ]),

    value: z
      .string()
      .min(2)
      .max(20000),

    typedName: z.string().optional(),
  }),
});

/* =========================================================
   TYPES
========================================================= */

export type AgreementInput =
  z.infer<typeof agreementSchema>;

export type {
  AgreementDocument,
  AgreementStatus,
};

export type AgreementTimelineItem = {
  at: string;
  actor: string;
  action: string;
  note: string;
};

export type AgreementRecord =
  AgreementInput & {
    id: string;

    agreementNo: string;

    status: AgreementStatus;

    submittedAt: string;

    approvalDate?: string;

    lockedAt?: string;

    deletedAt?: string;

    deletedBy?: string;

    version: number;

    verificationToken: string;

    verificationUrl: string;

    adminNotes: string[];

    assignedDepartment?: string;

    versionHistory: Array<{
      version: number;
      at: string;
      actor: string;
      note: string;
    }>;

    auditLog: AgreementTimelineItem[];
  };

/* =========================================================
   HELPERS
========================================================= */

function createAgreementNo(): string {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  return `NPN-AGR-${date}-${crypto
    .randomUUID()
    .slice(0, 8)
    .toUpperCase()}`;
}

function createVerificationToken(): string {
  return crypto
    .randomUUID()
    .replace(/-/g, "");
}

function createVerificationUrl(
  token: string
): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  return `${siteUrl}/agreement/verify/${token}`;
}

/* =========================================================
   MAP SUPABASE ROW → APPLICATION OBJECT
========================================================= */

function mapAgreementRow(
  row: any
): AgreementRecord {
  const agreementData =
    row.agreement_data ?? {};

  return {
    /* Complete wizard data */
    patientId: row.patient_id,

    patient:
      agreementData.patient ?? {
        fullName: "",
        guardianName: "",
        gender: "",
        dob: "",
        age: 0,
        mobile: "",
        email: "",
        address: "",
        city: "",
        state: "",
        pinCode: "",
      },

    medical:
      agreementData.medical ?? {
        disease: "",
        symptoms: "",
        duration: "",
        previousTreatment: "",
        currentMedicines: "",
        medicalHistory: "",
        allergies: "",
        doctorPreference: "",
      },

    treatment:
      agreementData.treatment ?? {
        courseDuration: "",
        recommendedTherapy: "",
        assignedDoctor: "",
        hospitalBranch: "",
      },

    documents:
      agreementData.documents ?? [],

    confirmations:
      agreementData.confirmations ?? {
        declaration: false,
        treatmentConsent: false,
        privacyPolicy: false,
        medicalConfirmation: false,
        responsibilities: false,
        importantNotes: false,
        finalConsent: false,
      },

    signature:
      agreementData.signature ?? {
        mode: "type",
        value: "",
        typedName: "",
      },

    /* Database fields */

    id: row.id,

    agreementNo:
      row.agreement_number,

    status:
      row.status,

    submittedAt:
      row.submitted_at,

    approvalDate:
      row.approval_date ??
      undefined,

    lockedAt:
      row.locked_at ??
      undefined,

    deletedAt:
      row.deleted_at ??
      undefined,

    deletedBy:
      row.deleted_by ??
      undefined,

    version:
      row.version ?? 1,

    verificationToken:
      row.verification_token ?? "",

    verificationUrl:
      row.verification_url ?? "",

    adminNotes:
      Array.isArray(row.admin_notes)
        ? row.admin_notes
        : [],

    assignedDepartment:
      row.assigned_department ??
      undefined,

    versionHistory:
      Array.isArray(row.version_history)
        ? row.version_history
        : [],

    auditLog:
      Array.isArray(row.audit_log)
        ? row.audit_log
        : [],
  };
}

/* =========================================================
   GET ALL AGREEMENTS
========================================================= */

export async function getAgreements(
  includeDeleted = false
): Promise<AgreementRecord[]> {
  noStore();

  let query = supabaseAdmin
    .from("agreements")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  /*
   * Normally don't show soft-deleted agreements.
   */
  if (!includeDeleted) {
    query = query.is(
      "deleted_at",
      null
    );
  }

  const {
    data,
    error,
  } = await query;

  if (error) {
    console.error(
      "SUPABASE GET AGREEMENTS ERROR:",
      error
    );

    throw new Error(error.message);
  }

  return (data ?? []).map(
    mapAgreementRow
  );
}

/* =========================================================
   GET SINGLE AGREEMENT
========================================================= */

export async function getAgreementById(
  identifier: string
) {
  const value = identifier.trim();

  if (!value) {
    return undefined;
  }

  // --------------------------------------------------
  // If the identifier is a UUID, search by database id
  // --------------------------------------------------

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (uuidRegex.test(value)) {
    const { data, error } = await supabaseAdmin
      .from("agreements")
      .select("*")
      .eq("id", value)
      .maybeSingle();

    if (error) {
      console.error(
        "SUPABASE GET AGREEMENT BY ID ERROR:",
        error
      );

      throw new Error(error.message);
    }

    return data ?? undefined;
  }

  // --------------------------------------------------
  // Otherwise search by agreement number
  // Example:
  // NPN-AGR-20260808-12322123
  // --------------------------------------------------

  const { data, error } = await supabaseAdmin
    .from("agreements")
    .select("*")
    .eq("agreement_number", value)
    .maybeSingle();

  if (error) {
    console.error(
      "SUPABASE GET AGREEMENT BY NUMBER ERROR:",
      error
    );

    throw new Error(error.message);
  }

  return data ?? undefined;
}

/* =========================================================
   CREATE AGREEMENT
========================================================= */

export async function addAgreement(
  input: AgreementInput
): Promise<AgreementRecord> {
  const now =
    new Date().toISOString();

  const agreementNo =
    createAgreementNo();

  const verificationToken =
    createVerificationToken();

  const verificationUrl =
    createVerificationUrl(
      verificationToken
    );

  /* =======================================================
     VERSION HISTORY
  ======================================================= */

  const versionHistory = [
    {
      version: 1,

      at: now,

      actor: "Patient",

      note:
        "Initial agreement submission.",
    },
  ];

  /* =======================================================
     AUDIT LOG
  ======================================================= */

  const auditLog = [
    {
      at: now,

      actor: "Patient",

      action: "Submitted",

      note:
        "Digital agreement submitted by patient.",
    },
  ];

  /* =======================================================
     COMPLETE FORM DATA
     
     This is stored inside agreement_data JSONB.
  ======================================================= */

  const agreementData = {
    patient: input.patient,

    medical: input.medical,

    treatment: input.treatment,

    documents: input.documents,

    confirmations:
      input.confirmations,

    signature:
      input.signature,
  };

  /* =======================================================
     INSERT INTO SUPABASE
  ======================================================= */

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("agreements")
    .insert({
      patient_id:
        input.patientId,

      status:
        "Submitted",

      agreement_number:
        agreementNo,

      submitted_at:
        now,

      version:
        1,

      verification_token:
        verificationToken,

      verification_url:
        verificationUrl,

      admin_notes:
        [],

      version_history:
        versionHistory,

      audit_log:
        auditLog,

      assigned_department:
        null,

      deleted_at:
        null,

      deleted_by:
        null,

      agreement_data:
        agreementData,
    })
    .select("*")
    .single();

  /* =======================================================
     HANDLE SUPABASE ERROR
  ======================================================= */

  if (error) {
    console.error(
      "SUPABASE CREATE AGREEMENT ERROR:",
      error
    );

    throw new Error(
      error.message
    );
  }

  /* =======================================================
     AUDIT SERVICE
     
     Audit failure should NOT delete a
     successfully saved agreement.
  ======================================================= */

  try {
    await appendAuditLog({
      action:
        "AGREEMENT_SUBMITTED",

      actorEmail:
        input.patient.email ||
        undefined,

      targetType:
        "Agreement",

      targetId:
        agreementNo,

      message:
        "Digital agreement submitted.",
    });
  } catch (auditError) {
    console.error(
      "AUDIT LOG ERROR:",
      auditError
    );
  }

  /* =======================================================
     RETURN CREATED AGREEMENT
  ======================================================= */

  return mapAgreementRow(
    data
  );
}

/* =========================================================
   UPDATE AGREEMENT
========================================================= */

export async function updateAgreement(
  id: string,
  update: {
    status?: AgreementStatus;

    note?: string;

    assignedDoctor?: string;

    assignedDepartment?: string;

    actor?: string;
  }
): Promise<
  AgreementRecord | undefined
> {
  const existing =
    await getAgreementById(id);

  if (!existing) {
    return undefined;
  }

  /*
   * Approved agreements are locked.
   */
  if (
    existing.status === "Approved" ||
    existing.lockedAt
  ) {
    return existing;
  }

  const now =
    new Date().toISOString();

  const nextStatus =
    update.status ??
    existing.status;

  const approving =
    nextStatus === "Approved";

  const nextVersion =
    approving
      ? existing.version
      : existing.version + 1;

  /* =======================================================
     VERSION HISTORY
  ======================================================= */

  const nextVersionHistory =
    approving
      ? existing.versionHistory
      : [
          {
            version:
              nextVersion,

            at:
              now,

            actor:
              update.actor ??
              "Admin",

            note:
              update.note ??
              `Agreement changed to ${nextStatus}.`,
          },

          ...existing.versionHistory,
        ];

  /* =======================================================
     AUDIT LOG
  ======================================================= */

  const nextAuditLog = [
    {
      at:
        now,

      actor:
        update.actor ??
        "Admin",

      action:
        nextStatus,

      note:
        update.note ??
        `Agreement marked as ${nextStatus}.`,
    },

    ...existing.auditLog,
  ];

  /* =======================================================
     ADMIN NOTES
  ======================================================= */

  const nextAdminNotes =
    update.note
      ? [
          update.note,
          ...existing.adminNotes,
        ]
      : existing.adminNotes;

  /* =======================================================
     UPDATED FORM DATA
  ======================================================= */

  const updatedAgreementData = {
    patient:
      existing.patient,

    medical:
      existing.medical,

    treatment: {
      ...existing.treatment,

      assignedDoctor:
        update.assignedDoctor ??
        existing.treatment
          .assignedDoctor,
    },

    documents:
      existing.documents,

    confirmations:
      existing.confirmations,

    signature:
      existing.signature,
  };

  /* =======================================================
     UPDATE DATABASE
  ======================================================= */

  const updateData: Record<
    string,
    unknown
  > = {
    status:
      nextStatus,

    version:
      nextVersion,

    admin_notes:
      nextAdminNotes,

    version_history:
      nextVersionHistory,

    audit_log:
      nextAuditLog,

    assigned_department:
      update.assignedDepartment ??
      existing.assignedDepartment ??
      null,

    agreement_data:
      updatedAgreementData,
  };

  if (approving) {
    updateData.approval_date =
      now;

    updateData.locked_at =
      now;
  }

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("agreements")
    .update(updateData)
    .or(
      `id.eq.${id},agreement_number.eq.${id}`
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "SUPABASE UPDATE AGREEMENT ERROR:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return mapAgreementRow(
    data
  );
}

/* =========================================================
   SOFT DELETE AGREEMENT
========================================================= */

export async function deleteAgreement(
  id: string,
  actor = "Admin"
): Promise<
  AgreementRecord | undefined
> {
  const existing =
    await getAgreementById(id);

  if (!existing) {
    return undefined;
  }

  const now =
    new Date().toISOString();

  const nextAuditLog = [
    {
      at:
        now,

      actor:

        actor,

      action:
        "Soft Deleted",

      note:
        "Agreement removed from active review queue.",
    },

    ...existing.auditLog,
  ];

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("agreements")
    .update({
      deleted_at:
        now,

      deleted_by:
        actor,

      audit_log:
        nextAuditLog,
    })
    .or(
      `id.eq.${id},agreement_number.eq.${id}`
    )
    .select("*")
    .single();

  if (error) {
    console.error(
      "SUPABASE DELETE AGREEMENT ERROR:",
      error
    );

    throw new Error(
      error.message
    );
  }

  return mapAgreementRow(
    data
  );
}