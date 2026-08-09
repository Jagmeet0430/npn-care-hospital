import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";

import { Section } from "@/components/Section";
import { getAgreementById } from "@/lib/agreements";
import { getCmsContent } from "@/lib/cms";

type AgreementDetailProps = {
  params: Promise<{ id: string }>;
};
type AgreementAuditLogItem = {
  at: string;
  action: string;
  actor: string;
  note: string;
};

type AgreementDocument = {
  label: string;
  name: string;
  type?: string;
  size?: number;
  preview?: string;
};

export const metadata: Metadata = {
  title: "Agreement Details",
  description:
    "Admin agreement details, documents, signature, timeline, and notes.",
};

export const dynamic = "force-dynamic";

export default async function AgreementDetailPage({
  params,
}: AgreementDetailProps) {
  const { id } = await params;

  const agreement = await getAgreementById(id);
  const { hospital } = await getCmsContent();

  if (!agreement) {
    notFound();
  }

  const agreementText = [
    "Patient Declaration: The patient confirms that all personal details submitted are accurate.",
    "Treatment Consent: The patient understands treatment plans depend on doctor review, reports, and medical history.",
    "Privacy Policy: The hospital may store and use patient information for care, follow-up, billing, and records.",
    "Responsibilities: The patient agrees to follow medical guidance and provide truthful updates during treatment.",
    "Important Notes: Any assurance, refund, or outcome expectation must be confirmed in writing by the hospital.",
  ];

  const documents = (agreement.documents ?? []) as AgreementDocument[];

  return (
    <>
      <Section className="band">
        <div className="agreement-detail-header">
          <Link
            href="/admin/agreements"
            className="button button-quiet"
          >
            <ArrowLeft size={18} />
            Back to Agreements
          </Link>

          <div style={{ marginTop: 24 }}>
            <span className="eyebrow">Agreements</span>

            <h1>Agreement Details</h1>

            <h2>{agreement.agreementNo}</h2>

            <p className="lead">
              {agreement.patient.fullName} - {agreement.status}
            </p>
          </div>

          <div
            className="hero-actions"
            style={{ marginTop: 24 }}
          >
            <a
              className="button button-quiet"
              href={`/api/agreements/${agreement.agreementNo}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download size={18} />
              Download PDF
            </a>

            <a
              className="button button-quiet"
              href={`/api/agreements/${agreement.agreementNo}/pdf?print=1`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Printer size={18} />
              Print
            </a>
          </div>
        </div>
      </Section>

      <Section>
        <div className="agreement-detail-grid">
          <article className="card">
            <ShieldCheck size={24} color="#0F172A" />

            <h2>Patient Information</h2>

            <DetailList
              rows={[
                ["Name", agreement.patient.fullName],
                ["Father / Husband", agreement.patient.guardianName],
                ["Gender", agreement.patient.gender],
                [
                  "DOB / Age",
                  `${agreement.patient.dob} / ${agreement.patient.age}`,
                ],
                ["Mobile", agreement.patient.mobile],
                ["Email", agreement.patient.email || "Not provided"],
                [
                  "Address",
                  `${agreement.patient.address}, ${agreement.patient.city}, ${agreement.patient.state} ${agreement.patient.pinCode}`,
                ],
              ]}
            />
          </article>

          <article className="card">
            <FileText size={24} color="#0F172A" />

            <h2>Medical Information</h2>

            <DetailList
              rows={[
                ["Disease", agreement.medical.disease],
                ["Symptoms", agreement.medical.symptoms],
                ["Duration", agreement.medical.duration],
                [
                  "Previous Treatment",
                  agreement.medical.previousTreatment,
                ],
                [
                  "Current Medicines",
                  agreement.medical.currentMedicines,
                ],
                [
                  "Medical History",
                  agreement.medical.medicalHistory,
                ],
                ["Allergies", agreement.medical.allergies],
                [
                  "Doctor Preference",
                  agreement.medical.doctorPreference,
                ],
              ]}
            />
          </article>
        </div>
      </Section>

      <Section
        className="band"
        title="Treatment, Documents, and Signature"
      >
        <div className="agreement-detail-grid">
          <article className="card">
            <h3>Treatment Details</h3>

            <DetailList
              rows={[
                [
                  "Course Duration",
                  agreement.treatment.courseDuration,
                ],
                [
                  "Recommended Therapy",
                  agreement.treatment.recommendedTherapy,
                ],
                [
                  "Assigned Doctor",
                  agreement.treatment.assignedDoctor,
                ],
                [
                  "Assigned Department",
                  agreement.assignedDepartment || "Not assigned",
                ],
                [
                  "Hospital Branch",
                  agreement.treatment.hospitalBranch,
                ],
              ]}
            />
          </article>

          <article className="card">
            <h3>Digital Signature</h3>

            <div className="signature-preview">
              {agreement.signature?.value?.startsWith("data:image") ? (
                <img
                  src={agreement.signature.value}
                  alt="Patient signature"
                />
              ) : (
                <strong>
                  {agreement.signature?.value || "No signature"}
                </strong>
              )}
            </div>
          </article>
        </div>

        <div
          className="document-preview-grid"
          style={{ marginTop: 24 }}
        >
          {documents.length > 0 ? (
            documents.map(
              (document: AgreementDocument, index: number) => (
                <article
                  className="document-preview"
                  key={`${document.name}-${index}`}
                >
                  {document.preview ? (
                    <img
                      src={document.preview}
                      alt={document.label}
                    />
                  ) : (
                    <FileText size={34} />
                  )}

                  <strong>{document.label}</strong>

                  <span>{document.name}</span>

                  <small>
                    {document.size
                      ? `${Math.round(document.size / 1024)} KB`
                      : "Size unavailable"}
                  </small>
                </article>
              )
            )
          ) : (
            <article className="document-preview">
              <FileText size={34} />

              <strong>No documents uploaded</strong>

              <span>
                No documents are attached to this agreement.
              </span>
            </article>
          )}
        </div>
      </Section>

      <Section title="Agreement Text and Timeline">
        <div className="agreement-detail-grid">
          <article className="card">
            <h3>Agreement Text</h3>

            <ul className="check-list">
              {agreementText.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="qr-verification-card">
              <img
                src={`/api/agreements/${agreement.agreementNo}/qr`}
                alt={`QR verification for ${agreement.agreementNo}`}
              />

              <div>
                <strong>QR Verification</strong>

                <Link href={agreement.verificationUrl}>
                  {agreement.verificationUrl}
                </Link>

                <p>
                  {agreement.lockedAt
                    ? "Approved agreements are immutable."
                    : "Agreement remains editable until approval."}
                </p>
              </div>
            </div>

            <p>{hospital.address}</p>
          </article>

          <article className="card">
            <h3>Activity Timeline</h3>

            {agreement.auditLog.map((item: AgreementAuditLogItem) => (
  <div
    className="timeline-item"
    key={`${item.at}-${item.action}`}
  >
    <strong>{item.action}</strong>

    <span>
      {new Date(item.at).toLocaleString("en-IN")} by{" "}
      {item.actor}
    </span>

    <p>{item.note}</p>
  </div>
))}

            <h3>Internal Notes</h3>

            {agreement.adminNotes.length > 0 ? (
              agreement.adminNotes.map((note: string) => (
              <p key={note}>{note}</p>
            ))
            ) : (
              <p>No internal notes yet.</p>
            )}
          </article>
        </div>
      </Section>
    </>
  );
}

function DetailList({
  rows,
}: {
  rows: Array<[string, string | number | null | undefined]>;
}) {
  return (
    <dl className="detail-list">
      {rows.map(([label, value]) => (
        <div className="detail-list-row" key={label}>
          <dt>{label}</dt>

          <dd>{value ?? "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );
}