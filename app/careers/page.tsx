import type { Metadata } from "next";
import Link from "next/link";
import { BriefcaseBusiness, HeartHandshake, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { CareerApplicationForm } from "@/components/CareerApplicationForm";
import { Reveal } from "@/components/Motion";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Careers",
  description: "Apply online for current job openings at N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function CareersPage() {
  const { careers } = await getCmsContent();

  return (
    <>
      <section className="career-hero">
        <Reveal className="career-hero-copy">
          <span className="eyebrow">
            <BriefcaseBusiness size={18} />
            Careers
          </span>
          <h1>{careers.heroTitle}</h1>
          <p className="lead">{careers.heroText}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#apply-now">
              {careers.primaryButton}
            </Link>
            <Link className="button button-quiet" href="#openings">
              {careers.secondaryButton}
            </Link>
          </div>
        </Reveal>
      </section>

      <Section id="openings" eyebrow={careers.openingsEyebrow} title={careers.openingsTitle}>
        <div className="grid grid-4">
          {careers.openings.map((opening, index) => (
            <Reveal key={opening.title} delay={index * 0.05}>
              <article className="benefit-card">
                <span className="card-icon">
                  <UsersRound size={22} />
                </span>
                <h3>{opening.title}</h3>
                <p>{opening.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="band" eyebrow={careers.benefitsEyebrow} title={careers.benefitsTitle}>
        <div className="grid grid-3">
          {careers.benefits.map((benefit) => (
            <article className="card" key={benefit}>
              <ShieldCheck size={22} color="#0F172A" />
              <h3>{benefit}</h3>
              <p>Our team environment is built for consistency, respect, and long-term service quality.</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow={careers.cultureEyebrow} title={careers.cultureTitle}>
        <div className="intro-grid">
          {careers.cultureCards.map((card, index) => {
            const Icon = index === 0 ? HeartHandshake : Sparkles;
            return (
              <article className="premium-panel" key={card.title}>
                <Icon size={24} color="#1E293B" />
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </article>
            );
          })}
          <article className="premium-panel highlight-panel">
            <span className="eyebrow">{careers.quoteEyebrow}</span>
            <h3>{careers.quoteTitle}</h3>
            <p>{careers.quoteText}</p>
          </article>
        </div>
      </Section>

      <Section id="apply-now" className="band" eyebrow={careers.applicationEyebrow} title={careers.applicationTitle}>
        <div className="career-application-layout">
          <article className="premium-panel">
            <h3>{careers.applicationStatusTitle}</h3>
            <p>{careers.applicationStatusText}</p>
            <div className="status-list">
              {careers.statusList.map((status) => (
                <span className="status" key={status}>{status}</span>
              ))}
            </div>
          </article>
          <CareerApplicationForm />
        </div>
      </Section>

      <Section eyebrow={careers.faqEyebrow} title={careers.faqTitle}>
        <div className="grid grid-2">
          {careers.faqs.map((faq) => (
            <article className="faq-item" key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
