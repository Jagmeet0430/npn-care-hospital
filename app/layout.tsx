import type { Metadata } from "next";
import Link from "next/link";
import { Ambulance, Mail, MapPin, Phone } from "lucide-react";
import { HealthAssistant } from "@/components/HealthAssistant";
import { JsonLd } from "@/components/JsonLd";
import { IntroAnimation, PageLoadingBar, PageTransition } from "@/components/Motion";
import { SiteHeader } from "@/components/SiteHeader";
import { getCmsContent } from "@/lib/cms";
import { getPublishedTestimonials } from "@/lib/testimonials";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://npncarehospital.com"),
  title: {
    default: "N.P.N. Care Hospital | Integrated Healthcare for Better Living",
    template: "%s | N.P.N. Care Hospital"
  },
  description:
    "Personalized treatment through Ayurveda, Naturopathy, Electro Homeopathy, and Integrative Healthcare with experienced doctors.",
  keywords: [
    "NPN Care Hospital",
    "Navel Power Naturopathy India Pvt Ltd",
    "Ayurveda hospital Iglas",
    "Naturopathy hospital Aligarh",
    "Electro Homeopathy care",
    "joint pain treatment",
    "diabetes care",
    "chronic disease support"
  ],
  openGraph: {
    title: "N.P.N. Care Hospital",
    description: "Integrated Healthcare for Better Living",
    type: "website",
    images: ["/images/npn-care-hero.png"]
  },
  twitter: {
    card: "summary_large_image",
    title: "N.P.N. Care Hospital",
    description: "Integrated Healthcare for Better Living",
    images: ["/images/npn-care-hero.png"]
  },
  alternates: {
    canonical: "/"
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getCmsContent();
  const testimonials = await getPublishedTestimonials();
  const { footer, hospital } = content;

  return (
    <html lang="en">
      <body>
        <JsonLd content={content} testimonials={testimonials} />
        <PageLoadingBar />
        <IntroAnimation brandName={hospital.name} tagline="Compassion • Care • Excellence" />
        <SiteHeader />
        <PageTransition>
          <main>{children}</main>
        </PageTransition>
        <HealthAssistant />
        <footer className="footer">
          <div className="footer-grid">
            <div>
              <Link href="/" className="brand footer-brand">
                <span className="brand-mark">N</span>
                <span>
                  <strong>{hospital.name}</strong>
                  <small>{hospital.legalName}</small>
                </span>
              </Link>
              <p>Reg. No.: {hospital.registrationNo}</p>
              <p>{footer.description}</p>
            </div>
            <div>
              <h3>Explore</h3>
              {footer.exploreLinks.map((item) => (
                <Link href={item.href} key={`${item.label}-${item.href}`}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div>
              <h3>Contact</h3>
              <a href={`tel:${hospital.phone}`}>
                <Phone size={17} />
                {hospital.phone}
              </a>
              <a href={`tel:${hospital.secondaryPhone}`}>
                <Phone size={17} />
                {hospital.secondaryPhone}
              </a>
              <a href={`mailto:${hospital.email}`}>
                <Mail size={17} />
                {hospital.email}
              </a>
              <a href={`tel:${hospital.emergency}`}>
                <Ambulance size={17} />
                {hospital.emergency}
              </a>
            </div>
            <div>
              <h3>Visit</h3>
              <p>
                <MapPin size={17} />
                {hospital.address}
              </p>
              <p>{hospital.hours}</p>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{footer.bottomLeft}</span>
            <span>{footer.bottomRight}</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
