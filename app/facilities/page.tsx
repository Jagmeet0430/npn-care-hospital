import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, MapPin } from "lucide-react";
import { CmsIcon } from "@/components/CmsIcon";
import { Section } from "@/components/Section";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Hospital Facilities",
  description: "Reception, consultation rooms, therapy rooms, wellness spaces, pharmacy, patient lounge, modern equipment, and clean environment."
};

export const dynamic = "force-dynamic";

export default async function FacilitiesPage() {
  const { facilities, homepage, hospital } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Hospital Facilities</span>
          <h1>{homepage.facilitiesTitle}</h1>
          <p className="lead">{homepage.facilitiesText}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/#appointment">
              <CalendarCheck size={18} />
              Book Appointment
            </Link>
            <Link className="button button-quiet" href="/contact">
              <MapPin size={18} />
              Plan Visit
            </Link>
          </div>
        </div>
      </section>

      <Section title="Explore Facilities">
        <div className="grid grid-4">
          {facilities.map((facility) => (
            <article className="card" key={facility.name}>
              <span className="card-icon">
                <CmsIcon iconKey={facility.iconKey} />
              </span>
              <h3>{facility.name}</h3>
              <p>{facility.summary}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section className="band" eyebrow="Visit Support" title="A calm arrival for patients and families.">
        <div className="split">
          <div className="contact-panel">
            <div className="contact-row">
              <MapPin size={21} />
              {hospital.address}
            </div>
            <div className="contact-row">
              <CalendarCheck size={21} />
              {hospital.hours}
            </div>
          </div>
          <iframe
            className="map-frame"
            title="N.P.N. Care Hospital location"
            loading="lazy"
            src={`https://www.google.com/maps?q=${encodeURIComponent(hospital.mapQuery)}&output=embed`}
          />
        </div>
      </Section>
    </>
  );
}
