import { unstable_noStore as noStore } from "next/cache";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { appendAuditLog } from "@/lib/audit";
import { agreementDocumentSchema, type AgreementDocument, type AgreementStatus } from "@/lib/agreement-shared";
import { decryptJson, encryptJson, isEncryptedPayload } from "@/lib/secure-json-store";

export const agreementSchema = z.object({
  patient: z.object({
    fullName: z.string().min(2).max(120),
    guardianName: z.string().min(2).max(120),
    gender: z.string().min(1).max(40),
    dob: z.string().min(1).max(40),
    age: z.coerce.number().min(1).max(120),
    mobile: z.string().min(10).max(24),
    email: z.string().email().optional().or(z.literal("")),
    address: z.string().min(5).max(240),
    city: z.string().min(2).max(80),
    state: z.string().min(2).max(80),
    pinCode: z.string().min(4).max(12)
  }),
  medical: z.object({
    disease: z.string().min(2).max(160),
    symptoms: z.string().min(2).max(600),
    duration: z.string().min(1).max(80),
    previousTreatment: z.string().min(1).max(500),
    currentMedicines: z.string().min(1).max(500),
    medicalHistory: z.string().min(1).max(500),
    allergies: z.string().min(1).max(300),
    doctorPreference: z.string().min(1).max(120)
  }),
  treatment: z.object({
    courseDuration: z.string().min(1).max(120),
    recommendedTherapy: z.string().min(2).max(180),
    assignedDoctor: z.string().min(1).max(120),
    hospitalBranch: z.string().min(2).max(160)
  }),
  documents: z.array(agreementDocumentSchema).min(1),
  confirmations: z.object({
    declaration: z.boolean().refine(Boolean),
    treatmentConsent: z.boolean().refine(Boolean),
    privacyPolicy: z.boolean().refine(Boolean),
    medicalConfirmation: z.boolean().refine(Boolean),
    responsibilities: z.boolean().refine(Boolean),
    importantNotes: z.boolean().refine(Boolean),
    finalConsent: z.boolean().refine(Boolean)
  }),
  signature: z.object({
    mode: z.enum(["draw", "type", "upload"]),
    value: z.string().min(2).max(20000),
    typedName: z.string().optional()
  })
});

export type AgreementInput = z.infer<typeof agreementSchema>;
export type { AgreementDocument, AgreementStatus };

export type AgreementTimelineItem = {
  at: string;
  actor: string;
  action: string;
  note: string;
};

export type AgreementRecord = AgreementInput & {
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
  versionHistory: Array<{ version: number; at: string; actor: string; note: string }>;
  auditLog: AgreementTimelineItem[];
};

const agreementPath = path.join(process.cwd(), "data", "agreements.json");

function normalizeAgreement(agreement: AgreementRecord): AgreementRecord {
  const verificationToken = agreement.verificationToken ?? createVerificationToken();
  return {
    ...agreement,
    version: agreement.version ?? 1,
    verificationToken,
    verificationUrl: agreement.verificationUrl ?? createVerificationUrl(verificationToken),
    versionHistory: agreement.versionHistory ?? [
      {
        version: agreement.version ?? 1,
        at: agreement.submittedAt,
        actor: "System",
        note: "Legacy agreement imported into secure version history."
      }
    ],
    auditLog: agreement.auditLog ?? []
  };
}

function createAgreementNo() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `NPN-AGR-${date}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

function createVerificationToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

function createVerificationUrl(token: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${siteUrl}/agreement/verify/${token}`;
}

async function saveAgreements(agreements: AgreementRecord[]) {
  await mkdir(path.dirname(agreementPath), { recursive: true });
  await writeFile(agreementPath, `${JSON.stringify(encryptJson(agreements), null, 2)}\n`, "utf8");
}

export async function getAgreements(includeDeleted = false): Promise<AgreementRecord[]> {
  noStore();

  try {
    const raw = await readFile(agreementPath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const agreements = isEncryptedPayload(parsed) ? decryptJson<AgreementRecord[]>(parsed) : (parsed as AgreementRecord[]);
    const normalized = agreements.map(normalizeAgreement);
    return includeDeleted ? normalized : normalized.filter((agreement) => !agreement.deletedAt);
  } catch {
    await saveAgreements([]);
    return [];
  }
}

export async function deleteAgreement(
  id: string,
  actor = "Admin"
): Promise<AgreementRecord | undefined> {
  const agreements = await getAgreements(true);
  const index = agreements.findIndex((agreement) => agreement.id === id || agreement.agreementNo === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const agreement = agreements[index];
  const deletedAgreement: AgreementRecord = {
    ...agreement,
    deletedAt: now,
    deletedBy: actor,
    auditLog: [
      {
        at: now,
        actor,
        action: "Soft Deleted",
        note: "Agreement removed from active review queue."
      },
      ...agreement.auditLog
    ]
  };

  agreements[index] = deletedAgreement;
  await saveAgreements(agreements);
  return deletedAgreement;
}

export async function getAgreementById(id: string): Promise<AgreementRecord | undefined> {
  const agreements = await getAgreements();
  return agreements.find((agreement) => agreement.id === id || agreement.agreementNo === id);
}

export async function addAgreement(input: AgreementInput): Promise<AgreementRecord> {
  const agreements = await getAgreements();
  const now = new Date().toISOString();
  const verificationToken = createVerificationToken();
  const agreement: AgreementRecord = {
    ...input,
    id: crypto.randomUUID(),
    agreementNo: createAgreementNo(),
    version: 1,
    verificationToken,
    verificationUrl: createVerificationUrl(verificationToken),
    status: "Submitted",
    submittedAt: now,
    adminNotes: [],
    versionHistory: [{ version: 1, at: now, actor: "Patient", note: "Initial agreement submission." }],
    auditLog: [
      {
        at: now,
        actor: "Patient",
        action: "Submitted",
        note: "Digital agreement submitted by patient."
      }
    ]
  };

  agreements.unshift(agreement);
  await saveAgreements(agreements);
  await appendAuditLog({
    action: "AGREEMENT_SUBMITTED",
    actorEmail: input.patient.email || undefined,
    targetType: "Agreement",
    targetId: agreement.agreementNo,
    message: "Digital agreement submitted."
  });
  return agreement;
}

export async function updateAgreement(
  id: string,
  update: {
    status?: AgreementStatus;
    note?: string;
    assignedDoctor?: string;
    assignedDepartment?: string;
    actor?: string;
  }
): Promise<AgreementRecord | undefined> {
  const agreements = await getAgreements();
  const index = agreements.findIndex((agreement) => agreement.id === id || agreement.agreementNo === id);
  if (index === -1) return undefined;

  const now = new Date().toISOString();
  const agreement = agreements[index];
  if (agreement.status === "Approved" || agreement.lockedAt) {
    return agreement;
  }

  const nextStatus = update.status ?? agreement.status;
  const approving = nextStatus === "Approved";
  const nextAgreement: AgreementRecord = {
    ...agreement,
    status: nextStatus,
    version: approving ? agreement.version : agreement.version + 1,
    treatment: {
      ...agreement.treatment,
      assignedDoctor: update.assignedDoctor ?? agreement.treatment.assignedDoctor
    },
    assignedDepartment: update.assignedDepartment ?? agreement.assignedDepartment,
    approvalDate: approving ? now : agreement.approvalDate,
    lockedAt: approving ? now : agreement.lockedAt,
    adminNotes: update.note ? [update.note, ...agreement.adminNotes] : agreement.adminNotes,
    versionHistory: approving
      ? agreement.versionHistory
      : [
          {
            version: agreement.version + 1,
            at: now,
            actor: update.actor ?? "Admin",
            note: update.note ?? `Agreement changed to ${nextStatus}.`
          },
          ...agreement.versionHistory
        ],
    auditLog: [
      {
        at: now,
        actor: update.actor ?? "Admin",
        action: nextStatus,
        note: update.note ?? `Agreement marked as ${nextStatus}.`
      },
      ...agreement.auditLog
    ]
  };

  agreements[index] = nextAgreement;
  await saveAgreements(agreements);
  return nextAgreement;
}
