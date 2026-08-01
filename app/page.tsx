import Image from "next/image";
import Link from "next/link";
import {
  Ambulance,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  FileCheck,
  HeartPulse,
  MapPin,
  MessageCircle,
  Microscope,
  Phone,
  ShieldCheck,
  Stethoscope,
  type LucideIcon
} from "lucide-react";
import { AppointmentForm } from "@/components/AppointmentForm";
import { CmsIcon } from "@/components/CmsIcon";
import { HeroText } from "@/components/HeroText";
import { HospitalMap } from "@/components/HospitalMap";
import { AnimatedCounter, Reveal } from "@/components/Motion";
import { Section } from "@/components/Section";
import { TestimonialSlider } from "@/components/TestimonialSlider";
import { getCmsContent } from "@/lib/cms";
import { getPublishedTestimonials } from "@/lib/testimonials";

export const dynamic = "force-dynamic";

type ServiceCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  tone: "sky" | "mint" | "peach" | "lavender" | "cream" | "aqua";
};

type HomepageArticle = {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  image?: string;
  publishedAt?: string;
  status?: "Published" | "Draft";
  scheduledFor?: string;
  featured?: boolean;
  displayOrder?: number;
};

const serviceCards: ServiceCard[] = [
  {
    title: "Book Appointment",
    description: "Schedule appointments with experienced doctors.",
    href: "#appointment",
    icon: CalendarDays,
    tone: "sky"
  },
  {
    title: "Departments",
    description: "Explore our specialized medical departments.",
    href: "/departments",
    icon: Building2,
    tone: "mint"
  },
  {
    title: "Treatments",
    description: "Discover personalized treatment plans.",
    href: "/treatments",
    icon: HeartPulse,
    tone: "peach"
  },
  {
    title: "Doctors",
    description: "Meet our experienced healthcare professionals.",
    href: "/doctors",
    icon: Stethoscope,
    tone: "lavender"
  },
  {
    title: "Health Checkups",
    description: "Preventive packages for all age groups.",
    href: "/schemes",
    icon: ShieldCheck,
    tone: "cream"
  },
  {
    title: "Diagnostics",
    description: "Advanced laboratory and diagnostic services.",
    href: "/departments",
    icon: Microscope,
    tone: "aqua"
  },
  {
    title: "Patient Agreement",
    description: "Complete your agreement digitally.",
    href: "/agreement",
    icon: FileCheck,
    tone: "sky"
  },
  {
    title: "Career Opportunities",
    description: "Join the N.P.N Care Hospital team.",
    href: "/careers",
    icon: BriefcaseBusiness,
    tone: "mint"
  }
];

export default async function Home() {
  const {
    facilities,
    hero,
    homepage,
    hospital,
    journey,
    blogPosts,
    trustStats,
    values
  } = await getCmsContent();
  const testimonials = await getPublishedTestimonials();
  const featuredFacilities = facilities.slice(0, 6);
  const homepageTestimonials = testimonials.filter((testimonial) => testimonial.featured);
  const now = Date.now();
  const featuredArticles = (blogPosts as HomepageArticle[])
    .filter((post) => {
      const status = post.status ?? "Published";
      const scheduledAt = post.scheduledFor ? new Date(post.scheduledFor).getTime() : 0;
      return post.featured === true && status !== "Draft" && (!scheduledAt || scheduledAt <= now);
    })
    .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime())
    .slice(0, 3);

  return (
    <>
      <section className="hero">
        <HeroText hero={hero} />
      </section>

      <section className="trust-strip" aria-label="Hospital trust indicators">
        {trustStats.map((stat) => (
          <article className="trust-stat" key={stat.label}>
            <strong><AnimatedCounter value={stat.value} /></strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </section>

      <Section
        className="healthcare-services-section"
        title="Our Healthcare Services"
        text="Everything you need for better health under one trusted hospital."
      >
        <div className="service-card-grid">
          {serviceCards.map((service, index) => {
            const Icon = service.icon;

            return (
              <Reveal delay={index * 0.1} key={service.title}>
                <Link
                  aria-label={`${service.title}: ${service.description}`}
                  className={`service-card service-card-${service.tone}`}
                  href={service.href}
                >
                  <span className="service-card-badge">
                    <Icon size={42} />
                  </span>
                  <span className="service-card-copy">
                    <strong>{service.title}</strong>
                    <small>{service.description}</small>
                  </span>
                  <span className="service-card-arrow" aria-hidden="true">
                    <ArrowRight size={20} />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Section>

      <Section
        eyebrow="Hospital Introduction"
        title={homepage.aboutTitle}
        text={homepage.aboutLead}
      >
        <div className="intro-grid">
          <article className="premium-panel">
            <span className="card-icon">
              <ShieldCheck size={22} />
            </span>
            <h3>{homepage.missionTitle}</h3>
            <p>{homepage.missionText}</p>
          </article>
          <article className="premium-panel">
            <span className="card-icon">
              <Stethoscope size={22} />
            </span>
            <h3>{homepage.visionTitle}</h3>
            <p>{homepage.visionText}</p>
          </article>
          <article className="premium-panel highlight-panel">
            <span className="eyebrow">Care Promise</span>
            <h3>{homepage.responsibleTitle}</h3>
            <p>{homepage.responsibleText}</p>
          </article>
        </div>
      </Section>

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
                  <CheckCircle2 size={21} color="#0F172A" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Section>

      <Section eyebrow="Why Choose Us" title={homepage.whyTitle} text={homepage.whyText}>
        <div className="grid grid-4">
          {values.slice(0, 8).map((value) => (
            <Reveal key={value.title}>
              <article className="benefit-card">
                <span className="card-icon">
                  <CmsIcon iconKey={value.iconKey} />
                </span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            </Reveal>
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

      <Section eyebrow="Facilities" title={homepage.facilitiesTitle} text={homepage.facilitiesText}>
        <div className="grid grid-3">
          {featuredFacilities.map((facility) => (
            <article className="facility-card" key={facility.name}>
              <span className="card-icon">
                <CmsIcon iconKey={facility.iconKey} />
              </span>
              <h3>{facility.name}</h3>
              <p>{facility.summary}</p>
            </article>
          ))}
        </div>
      </Section>

      {homepageTestimonials.length ? (
        <Section id="stories" eyebrow="Patient Stories" title={homepage.storiesTitle}>
          <TestimonialSlider testimonials={homepageTestimonials} />
        </Section>
      ) : null}

      {featuredArticles.length ? (
        <Section className="band" eyebrow="Health Education" title={homepage.blogTitle}>
          <div className="homepage-article-grid">
            {featuredArticles.map((post) => (
              <article className="homepage-article-card" key={post.slug}>
                <div className="homepage-article-image">
                  <Image src={post.image || "/images/npn-care-hero.png"} alt="" fill sizes="(max-width: 720px) 100vw, 33vw" />
                </div>
                <div className="homepage-article-body">
                  <span className="eyebrow">{post.category}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="homepage-article-meta">
                    <strong>{post.readTime}</strong>
                  </div>
                  <Link className="card-link" href={`/blog/${post.slug}`}>
                    Read Article <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

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

      <Section eyebrow="Location" title={homepage.contactTitle}>
        <div className="location-grid">
          <article className="premium-panel">
            <MapPin size={24} color="#1E293B" />
            <h3>{hospital.address}</h3>
            <p>{hospital.hours}</p>
            <div className="hero-actions">
              <Link className="button button-primary" href={`tel:${hospital.phone}`}>
                <Phone size={18} />
                Call Hospital
              </Link>
              <Link className="button button-quiet" href={`https://wa.me/${hospital.whatsapp.replace(/\D/g, "")}`}>
                <MessageCircle size={18} />
                WhatsApp
              </Link>
            </div>
          </article>
          <HospitalMap name={hospital.name} address={hospital.address} mapQuery={hospital.mapQuery} />
        </div>
      </Section>

    </>
  );
}
