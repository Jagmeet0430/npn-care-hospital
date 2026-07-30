import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { getAgreements } from "@/lib/agreements";

export const metadata: Metadata = {
  title: "Agreement Verification",
  description: "Verify an N.P.N. Care Hospital digital agreement."
};

type AgreementVerifyPageProps = {
  params: Promise<{ token: string }>;
};

export default async function AgreementVerifyPage({ params }: AgreementVerifyPageProps) {
  const { token } = await params;
  const agreements = await getAgreements();
  const agreement = agreements.find((item) => item.verificationToken === token);

  if (!agreement) {
    return (
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Verification</span>
          <h1>Agreement not found.</h1>
          <p className="lead">Please check the QR code or contact the hospital desk.</p>
          <Link className="button button-primary" href="/contact">
            Contact Hospital
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-hero">
      <div className="page-hero-content">
        <span className="eyebrow">
          <ShieldCheck size={17} />
          Agreement Verification
        </span>
        <h1>{agreement.status === "Approved" ? "Verified approved agreement." : "Agreement record verified."}</h1>
        <p className="lead">This page confirms the agreement ID and status without exposing patient medical details.</p>
        <div className="verification-card">
          <p>
            <strong>Agreement ID</strong>
            {agreement.agreementNo}
          </p>
          <p>
            <strong>Status</strong>
            {agreement.status}
          </p>
          <p>
            <strong>Submitted</strong>
            {new Date(agreement.submittedAt).toLocaleDateString("en-IN")}
          </p>
          <p>
            <strong>Version</strong>
            {agreement.version}
          </p>
          {agreement.lockedAt ? (
            <p>
              <strong>Approved Lock</strong>
              <CheckCircle2 size={17} />
              Immutable after approval
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
