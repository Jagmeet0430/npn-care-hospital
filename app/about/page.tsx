import type { Metadata } from "next";
import { Award, CheckCircle2 } from "lucide-react";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About",
  description: "About N.P.N. Care Hospital and its integrated Ayurveda, Naturopathy, and Electro Homeopathy care approach."
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const { homepage, hospital, trustStats, values } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">
            <Award size={18} />
            Reg. No. {hospital.registrationNo}
          </span>
          <h1>About {hospital.name}</h1>
          <p className="lead">{homepage.aboutLead}</p>
        </div>
      </section>

      <Section title={homepage.aboutTitle}>
        <div className="split">
          <div>
            <p className="lead">
              {homepage.aboutLead}
            </p>
            <ul className="mission-list">
              {homepage.aboutBullets.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={21} color="#0F172A" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="about-panel">
            <article className="card">
              <span className="eyebrow">Mission</span>
              <h3>{homepage.missionTitle}</h3>
              <p>{homepage.missionText}</p>
            </article>
            <article className="card">
              <span className="eyebrow">Vision</span>
              <h3>{homepage.visionTitle}</h3>
              <p>{homepage.visionText}</p>
            </article>
          </div>
        </div>
      </Section>

      <Section className="band" eyebrow="Values" title="What patients should feel here.">
        <div className="grid grid-4">
          {values.map((item) => (
            <article className="card" key={item.title}>
              <span className="card-icon">
                <CmsIcon iconKey={item.iconKey} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Trust Signals" title="Key hospital details.">
        <div className="stats-grid">
          {trustStats.map((stat) => (
            <div className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
