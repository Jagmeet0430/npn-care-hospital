import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CheckCircle2, Phone } from "lucide-react";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Schemes",
  description: "Free registration support, private insurance guidance, documented assurance, and patient notices."
};

export const dynamic = "force-dynamic";

export default async function SchemesPage() {
  const { homepage, hospital, patientHindiHighlights, patientSchemes } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Schemes and Notices</span>
          <h1>{homepage.schemesTitle}</h1>
          <p className="lead">{homepage.schemesText}</p>
        </div>
      </section>

      <Section title="Patient Support">
        <div className="grid grid-4">
          {patientSchemes.map((scheme) => (
            <article className="card" key={scheme.title}>
              <span className="card-icon">
                <CmsIcon iconKey={scheme.iconKey} />
              </span>
              <h3>{scheme.title}</h3>
              <p>{scheme.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="band" eyebrow="Hindi Help" title={"\u092e\u0930\u0940\u091c\u094b\u0902 \u0914\u0930 \u092a\u0930\u093f\u0935\u093e\u0930\u094b\u0902 \u0915\u0947 \u0932\u093f\u090f \u091c\u0930\u0942\u0930\u0940 \u091c\u093e\u0928\u0915\u093e\u0930\u0940"}>
        <div className="split">
          <article className="card">
            <ul className="mission-list">
              {patientHindiHighlights.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={21} color="#0F172A" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="card">
            <span className="eyebrow">Verify Before Treatment</span>
            <h3>{homepage.responsibleTitle}</h3>
            <p>{homepage.responsibleText}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/#appointment">
                <CalendarCheck size={18} />
                Book Appointment
              </Link>
              <a className="button button-quiet" href={`tel:${hospital.phone}`}>
                <Phone size={18} />
                Call Hospital
              </a>
            </div>
          </article>
        </div>
      </Section>
    </>
  );
}
