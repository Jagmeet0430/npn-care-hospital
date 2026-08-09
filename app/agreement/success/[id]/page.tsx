import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Section } from "@/components/Section";
import { getAgreementById } from "@/lib/agreements";
import AgreementSuccessActions from "@/components/AgreementSuccessActions";

type SuccessPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Agreement Submitted",
  description:
    "Digital agreement submitted successfully and pending hospital review.",
};

export const dynamic = "force-dynamic";

export default async function AgreementSuccessPage({
  params,
}: SuccessPageProps) {
  const { id } = await params;

  const agreement = await getAgreementById(id);

  const agreementNo = agreement?.agreementNo ?? id;
  const status = agreement?.status ?? "Pending Review";

  return (
    <Section className="band">
      <div className="success-panel" id="agreement-success-panel">
        {/* Success Icon */}
        <span className="success-icon">
          <CheckCircle2 size={38} />
        </span>

        {/* Heading */}
        <span className="eyebrow">
          Agreement Submitted Successfully
        </span>

        {/* Agreement Number */}
        <h1>{agreementNo}</h1>

        {/* Status */}
        <p className="lead">
          Status: {status}
        </p>

        {/* Description */}
        <p>
          Your digital agreement has been stored and sent for
          hospital review. The admin team can approve, reject,
          or request changes from the Agreement Management
          module.
        </p>

        {/* Actions */}
        <div className="hero-actions">
          {/* Patient Dashboard */}
          <Link
            className="button button-primary"
            href="/patient"
          >
            View Patient Dashboard
          </Link>

          {/* PDF + Print */}
          <AgreementSuccessActions />
        </div>
      </div>
    </Section>
  );
}