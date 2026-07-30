import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  MapPin,
  MessageCircle,
  Phone,
  Star
} from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const dynamic = "force-dynamic";

export default async function Home() {
  const {
    departments,
    hero,
    homepage,
    hospital,
    journey,
    testimonials
  } = await getCmsContent();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">
            <Award size={18} />
            {hero.eyebrow}
          </span>
          <h1>{hero.title}</h1>
          <p className="lead">{hero.subtitle}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#appointment">
              <CalendarCheck size={19} />
              {hero.primaryButton}
            </Link>
            <Link className="button button-quiet" href={`https://wa.me/${hospital.whatsapp.replace(/\D/g, "")}`}>
              <MessageCircle size={19} />
              {hero.secondaryButton}
            </Link>
          </div>
          <div className="quick-contact" aria-label="Quick contact">
            <a className="quick-pill" href={`tel:${hospital.emergency}`}>
              <Ambulance size={18} />
              Helpline {hospital.emergency}
            </a>
            <a className="quick-pill" href={`https://wa.me/${hospital.whatsapp.replace(/\D/g, "")}`}>
              <MessageCircle size={18} />
              WhatsApp
            </a>
            <span className="quick-pill">
              <MapPin size={18} />
              {hero.locationLabel}
            </span>
          </div>
        </div>
      </section>

      <Section
        id="philosophy"
        className="band"
        eyebrow={homepage.philosophyEyebrow}
        title={homepage.philosophyTitle}
        text={homepage.philosophyText}
      >
        <div className="split">
          <div className="philosophy-visual" aria-label="Natural healthcare environment" />
          <article className="card">
            <h3>How care feels here</h3>
            <ul className="mission-list">
              {homepage.philosophyBullets.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={21} color="#0f8a55" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Section>

      <Section
        id="departments"
        eyebrow="Integrated Healthcare"
        title={homepage.departmentsTitle}
        text={homepage.departmentsText}
      >
        <div className="grid grid-3">
          {departments.map((department) => (
            <article className="card" key={department.name}>
              <span className="card-icon">
                <CmsIcon iconKey={department.iconKey} />
              </span>
              <h3>{department.name}</h3>
              <p>{department.summary}</p>
              <Link className="card-link" href={`/treatments?department=${encodeURIComponent(department.name)}`}>
                Explore care <ArrowRight size={16} />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section className="dark-band" eyebrow="Patient Journey" title={homepage.journeyTitle}>
        <div className="journey">
          {journey.map((item) => (
            <div className="journey-step" key={item}>
              <strong>{item}</strong>
            </div>
          ))}
        </div>
      </Section>

      <Section id="stories" eyebrow="Patient Stories" title={homepage.storiesTitle}>
        <div className="grid grid-3">
          {testimonials.map((story) => (
            <article className="card" key={story.name}>
              <div className="quick-contact" aria-label="Rating">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} size={17} fill="#c9a24a" color="#c9a24a" />
                ))}
              </div>
              <h3>{story.name}</h3>
              <p>{story.condition}</p>
              <p>&quot;{story.quote}&quot;</p>
            </article>
          ))}
        </div>
      </Section>

      <Section id="appointment" className="band" eyebrow="Book Appointment" title={homepage.appointmentTitle}>
        <div className="appointment-wrap">
          <div>
            <p className="lead">
              {homepage.appointmentText}
            </p>
            <div className="contact-panel">
              <a className="contact-row" href={`tel:${hospital.phone}`}>
                <Phone size={21} />
                {hospital.phone}
              </a>
              <a className="contact-row" href={`tel:${hospital.secondaryPhone}`}>
                <Phone size={21} />
                {hospital.secondaryPhone}
              </a>
              <a className="contact-row" href={`https://wa.me/${hospital.whatsapp.replace(/\D/g, "")}`}>
                <MessageCircle size={21} />
                WhatsApp consultation support
              </a>
              <a className="contact-row" href={`tel:${hospital.emergency}`}>
                <Ambulance size={21} />
                Helpline {hospital.emergency}
              </a>
            </div>
          </div>
          <AppointmentForm />
        </div>
      </Section>

    </>
  );
}
