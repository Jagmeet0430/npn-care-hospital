import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

type TreatmentPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TreatmentPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { treatments } = await getCmsContent();
  const treatment = treatments.find((item) => item.slug === slug);

  if (!treatment) {
    return {};
  }

  return {
    title: `${treatment.title} Treatment`,
    description: treatment.summary,
    alternates: {
      canonical: `/treatments/${treatment.slug}`
    },
    openGraph: {
      title: `${treatment.title} Treatment at N.P.N. Care Hospital`,
      description: treatment.summary
    }
  };
}

export default async function TreatmentPage({ params }: TreatmentPageProps) {
  const { slug } = await params;
  const { doctors, treatments } = await getCmsContent();
  const treatment = treatments.find((item) => item.slug === slug);

  if (!treatment) {
    notFound();
  }

  const carePathway = [
    "Doctor consultation and medical history review",
    "Report and lifestyle assessment",
    "Ayurveda, naturopathy, and integrative care plan",
    "Diet, sleep, stress, and daily routine guidance",
    "Therapy schedule and progress follow-up",
    "Long-term prevention and wellness support"
  ];
  const symptoms = [
    `Recurring or long-lasting ${treatment.title.toLowerCase()} symptoms`,
    "Discomfort affecting daily routine, sleep, work, or mobility",
    "Reports, medicines, or previous treatments that need a second review",
    "Weakness, stress, lifestyle imbalance, or repeated flare-ups"
  ];
  const benefits = [
    "Clear understanding of the condition before treatment starts",
    "Personalized care instead of one-size-fits-all advice",
    "Natural therapy, lifestyle, diet, and follow-up guidance in one plan",
    "Family-friendly instructions for safer daily recovery"
  ];
  const treatmentFaqs = [
    {
      q: `Is ${treatment.title.toLowerCase()} treatment the same for every patient?`,
      a: "No. The plan depends on symptoms, reports, medical history, age, current medicines, and doctor assessment."
    },
    {
      q: "Do I need to bring previous reports?",
      a: "Reports and prescriptions are helpful. If you do not have them, the doctor can still guide the next step after consultation."
    },
    {
      q: "Can I book online?",
      a: "Yes. Use the appointment form and the hospital team can confirm your visit by phone or WhatsApp."
    }
  ];

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <Link className="button button-quiet" href="/#treatments">
            <ArrowLeft size={18} />
            Treatments
          </Link>
          <span className="eyebrow">Treatment Detail</span>
          <h1>{treatment.title}</h1>
          <p className="lead">{treatment.summary}</p>
        </div>
      </section>

      <Section>
        <div className="treatment-detail">
          <article className="card">
            <span className="card-icon">
              <CmsIcon iconKey={treatment.iconKey} size={24} />
            </span>
            <h2>Overview</h2>
            <p>{treatment.details}</p>
            <h3>Treatment approach</h3>
            <ul className="check-list">
              {carePathway.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={21} color="#0f8a55" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <aside className="card">
            <h3>Quick care summary</h3>
            <ul className="meta-list">
              <li>
                <ShieldCheck size={18} />
                Doctor-led evaluation
              </li>
              <li>
                <Clock size={18} />
                Follow-up based recovery plan
              </li>
              <li>
                <CalendarCheck size={18} />
                Online appointment booking
              </li>
            </ul>
            <Link className="button button-primary" href="/#appointment">
              <CalendarCheck size={18} />
              Book Appointment
            </Link>
          </aside>
        </div>
      </Section>

      <Section className="band" eyebrow="Symptoms" title="When patients usually ask for this care.">
        <div className="grid grid-4">
          {symptoms.map((item) => (
            <article className="card" key={item}>
              <CheckCircle2 size={22} color="#0f8a55" />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Benefits" title="What a clear care plan should give you.">
        <div className="grid grid-4">
          {benefits.map((item) => (
            <article className="card" key={item}>
              <ShieldCheck size={22} color="#227a59" />
              <p>{item}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="band" eyebrow="Related Doctors" title="Speak with the care team.">
        <div className="grid grid-3">
          {doctors.slice(0, 3).map((doctor) => (
            <article className="doctor-card" key={doctor.name}>
              <div className="doctor-avatar">{doctor.initials}</div>
              <h3>{doctor.name}</h3>
              <p>{doctor.specialization}</p>
              <ul className="meta-list">
                <li>{doctor.qualification}</li>
                <li>{doctor.languages}</li>
              </ul>
              <Link className="button button-quiet" href="/#appointment">
                <CalendarCheck size={18} />
                Book Consultation
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section eyebrow="Treatment FAQs" title="Questions patients ask before starting.">
        <div className="grid grid-3">
          {treatmentFaqs.map((faq) => (
            <article className="faq-item" key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="band" eyebrow="Book Care" title={`Start your ${treatment.title.toLowerCase()} consultation.`}>
        <AppointmentForm />
      </Section>
    </>
  );
}
