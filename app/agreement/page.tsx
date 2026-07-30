import type { Metadata } from "next";
import { AgreementWizard } from "@/components/AgreementWizard";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Digital Patient Agreement",
  description: "Secure digital patient agreement and consent workflow for N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function AgreementPage() {
  const { departments, doctors, hospital } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Digital Agreement</span>
          <h1>Patient consent, documents, and signature in one secure workflow.</h1>
          <p className="lead">Complete your treatment agreement online before admin and doctor review.</p>
        </div>
      </section>
      <AgreementWizard departments={departments} doctors={doctors} hospital={hospital} />
    </>
  );
}
