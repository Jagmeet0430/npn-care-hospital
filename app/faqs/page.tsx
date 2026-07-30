import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Frequently asked questions about appointments, reports, timings, free treatment, insurance, and hospital assurance."
};

export const dynamic = "force-dynamic";

export default async function FaqsPage() {
  const { faqs, homepage } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">FAQs</span>
          <h1>{homepage.faqTitle}</h1>
          <p className="lead">Clear information about reports, appointment booking, timings, free-treatment support, insurance, and written documentation.</p>
        </div>
      </section>

      <Section title="Frequently Asked Questions">
        <FaqAccordion faqs={faqs} />
      </Section>

      <Section className="band" title="Need personal guidance?">
        <Link className="button button-primary" href="/#appointment">
          <CalendarCheck size={18} />
          Book Appointment
        </Link>
      </Section>
    </>
  );
}
