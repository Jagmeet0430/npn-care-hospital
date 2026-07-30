import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck } from "lucide-react";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Doctors",
  description: "Meet the Ayurveda, naturopathy, and integrative healthcare doctors at N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function DoctorsPage() {
  const { doctors, homepage } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Doctors</span>
          <h1>{homepage.doctorsTitle}</h1>
          <p className="lead">Profiles are structured for quick decision-making with qualification, experience, specialization, languages, and appointment action.</p>
        </div>
      </section>

      <Section>
        <div className="grid grid-3">
          {doctors.map((doctor) => (
            <article className="doctor-card" key={doctor.name}>
              <div className="doctor-avatar">{doctor.initials}</div>
              <h3>{doctor.name}</h3>
              <p>{doctor.specialization}</p>
              <ul className="meta-list">
                <li>{doctor.qualification}</li>
                <li>{doctor.experience}</li>
                <li>{doctor.languages}</li>
              </ul>
              <Link className="button button-primary" href="/#appointment">
                <CalendarCheck size={18} />
                Book Appointment
              </Link>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
