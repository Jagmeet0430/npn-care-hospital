import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Treatments",
  description: "Browse treatment cards for chronic disease care, pain care, lifestyle disorders, and natural healing support."
};

export const dynamic = "force-dynamic";

export default async function TreatmentsPage() {
  const { conditionGroups, homepage, treatments } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Treatments</span>
          <h1>{homepage.treatmentsTitle}</h1>
          <p className="lead">{homepage.treatmentsText}</p>
        </div>
      </section>

      <Section title="All Treatments">
        <div className="grid grid-4">
          {treatments.map((treatment) => (
            <Link className="treatment-card" href={`/treatments/${treatment.slug}`} key={treatment.slug}>
              <span className="treatment-icon">
                <CmsIcon iconKey={treatment.iconKey} size={23} />
              </span>
              <h3>{treatment.title}</h3>
              <p>{treatment.summary}</p>
              <span className="card-link">
                View care plan <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="band" eyebrow="Condition Directory" title={homepage.conditionTitle}>
        <div className="grid grid-4">
          {conditionGroups.map((condition) => (
            <div className="contact-row" key={condition}>
              <CheckCircle2 size={20} color="#0f8a55" />
              {condition}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
