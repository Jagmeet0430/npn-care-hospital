import type { Metadata } from "next";
import { Ambulance, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Section } from "@/components/Section";
import { AppointmentForm } from "@/components/AppointmentForm";
import { getCmsContent } from "@/lib/cms";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact N.P.N. Care Hospital by phone, WhatsApp, email, emergency number, or map."
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const { homepage, hospital } = await getCmsContent();

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-content">
          <span className="eyebrow">Contact</span>
          <h1>{homepage.contactTitle}</h1>
          <p className="lead">Families can reach the hospital through the channel that is easiest for them.</p>
        </div>
      </section>

      <Section>
        <div className="split">
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
              {hospital.whatsapp}
            </a>
            <a className="contact-row" href={`mailto:${hospital.email}`}>
              <Mail size={21} />
              {hospital.email}
            </a>
            <a className="contact-row" href={`tel:${hospital.emergency}`}>
              <Ambulance size={21} />
              {hospital.emergency}
            </a>
            <div className="contact-row">
              <MapPin size={21} />
              {hospital.address}
            </div>
            <div className="contact-row">
              Reg. No.: {hospital.registrationNo}
            </div>
          </div>
          <AppointmentForm />
        </div>
      </Section>

      <Section className="band" title="Google Maps">
        <iframe
          className="map-frame"
          title="N.P.N. Care Hospital map"
          loading="lazy"
          src={`https://www.google.com/maps?q=${encodeURIComponent(hospital.mapQuery)}&output=embed`}
        />
      </Section>
    </>
  );
}
