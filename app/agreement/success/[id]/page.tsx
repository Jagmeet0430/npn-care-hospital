import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, Printer } from "lucide-react";
import { Section } from "@/components/Section";
import { getAgreementById } from "@/lib/agreements";

type SuccessPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Agreement Submitted",
  description: "Digital agreement submitted successfully and pending hospital review."
};

export const dynamic = "force-dynamic";

export default async function AgreementSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;
  const agreement = await getAgreementById(id);

  return (
    <Section className="band">
      <div className="success-panel">
        <span className="success-icon">
          <CheckCircle2 size={38} />
        </span>
        <span className="eyebrow">Agreement Submitted Successfully</span>
        <h1>{agreement?.agreementNo ?? id}</h1>
        <p className="lead">Status: {agreement?.status ?? "Pending Review"}</p>
        <p>
          Your digital agreement has been stored and sent for hospital review. The admin team can approve, reject, or request changes from the
          Agreement Management module.
        </p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/patient">
            View Patient Dashboard
          </Link>
          <button className="button button-quiet" type="button">
            <Download size={18} />
            Download PDF
          </button>
          <button className="button button-quiet" type="button">
            <Printer size={18} />
            Print
          </button>
        </div>
      </div>
    </Section>
  );
}
