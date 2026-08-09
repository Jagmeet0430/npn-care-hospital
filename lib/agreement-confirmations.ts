import type { AgreementInput } from "@/lib/agreements";

export type AgreementConfirmationInput =
  AgreementInput["confirmations"];

/**
 * Validates the confirmation section locally.
 *
 * Confirmations are saved together with the complete agreement
 * through POST /api/agreements.
 */
export function validateAgreementConfirmations(
  confirmations: AgreementConfirmationInput
): boolean {
  return (
    confirmations.declaration === true &&
    confirmations.treatmentConsent === true &&
    confirmations.privacyPolicy === true &&
    confirmations.medicalConfirmation === true &&
    confirmations.responsibilities === true &&
    confirmations.importantNotes === true &&
    confirmations.finalConsent === true
  );
}