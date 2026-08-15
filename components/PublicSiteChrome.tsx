"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ambulance,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Youtube,
} from "lucide-react";

import { HealthAssistant } from "@/components/HealthAssistant";
import { IntroAnimation, PageTransition } from "@/components/Motion";
import { SiteHeader } from "@/components/SiteHeader";

type Hospital = {
  name: string;
  legalName: string;
  registrationNo: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  emergency: string;
  facebook: string;
  instagram: string;
  youtube: string;
  address: string;
  hours: string;
};

type Footer = {
  description: string;
  exploreLinks: Array<{
    label: string;
    href: string;
  }>;
  bottomLeft: string;
  bottomRight: string;
};

type PublicSiteChromeProps = {
  children: React.ReactNode;
  hospital: Hospital;
  footer: Footer;
};

export function PublicSiteChrome({
  children,
  hospital,
  footer,
}: PublicSiteChromeProps) {
  const pathname = usePathname();

  /*
   * ADMIN AREA
   *
   * Do not render the public hospital header,
   * navigation, footer or AI assistant on /admin routes.
   */
  if (pathname?.startsWith("/admin")) {
    return (
      <main className="admin-route-root">
        {children}
      </main>
    );
  }

  /*
   * PUBLIC WEBSITE
   */
  return (
    <>
      <IntroAnimation
        brandName={hospital.name}
        tagline="Compassion • Care • Excellence"
      />

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

            <p>
              Reg. No.: {hospital.registrationNo}
            </p>

            <p>{footer.description}</p>
          </div>

          <div>
            <h3>Explore</h3>

            {footer.exploreLinks.map((item) => (
              <Link
                href={item.href}
                key={`${item.label}-${item.href}`}
              >
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

            <div className="footer-social">
              <span>Follow care updates</span>

              <div>
                <a
                  href={hospital.facebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Facebook"
                >
                  <Facebook size={18} />
                </a>

                <a
                  href={hospital.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open Instagram"
                >
                  <Instagram size={18} />
                </a>

                <a
                  href={hospital.youtube}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Open YouTube"
                >
                  <Youtube size={18} />
                </a>
              </div>
            </div>
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
    </>
  );
}