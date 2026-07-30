import { z } from "zod";

export const agreementStatusValues = ["Submitted", "Under Review", "Doctor Review", "Approved", "Rejected", "Need Revision"] as const;
export type AgreementStatus = (typeof agreementStatusValues)[number];

export const agreementDocumentSchema = z.object({
  label: z.string().min(2).max(80),
  name: z.string().min(1).max(180),
  type: z.string().min(1).max(100),
  size: z.number().min(0),
  preview: z.string().optional()
});

export type AgreementDocument = z.infer<typeof agreementDocumentSchema>;
