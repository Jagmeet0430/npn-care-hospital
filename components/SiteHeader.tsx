"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Ambulance,
  CalendarCheck,
  ChevronRight,
  Facebook,
  FileSignature,
  HeartPulse,
  Home,
  Images,
  Info,
  Instagram,
  Leaf,
  LogIn,
  Menu,
  MessageCircle,
  Newspaper,
  Phone,
  ShieldCheck,
  Sparkles,
  X,
  Youtube,
  type LucideIcon
} from "lucide-react";
import { hospital, navItems } from "@/lib/content";
import type { CmsContent } from "@/lib/cms";

const navMeta: Record<string, { icon: LucideIcon; description: string }> = {
  Home: { icon: Home, description: "Start from the calm hospital overview." },
  About: { icon: Info, description: "Know the hospital, mission, and care philosophy." },
  Treatments: { icon: HeartPulse, description: "Explore natural and integrative care pathways." },
  Agreement: { icon: FileSignature, description: "Complete digital consent and patient agreement." },
  Gallery: { icon: Images, description: "View hospital spaces, care moments, and media." },
  Blog: { icon: Newspaper, description: "Read wellness guidance and patient education." },
  Contact: { icon: Phone, description: "Find location, timings, and direct contact options." }
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [cmsHospital, setCmsHospital] = useState(hospital);
  const pathname = usePathname();
  const displayHospital = cmsHospital;

  useEffect(() => {
    fetch("/api/cms", { cache: "no-store" })
      .then((response) => response.json())
      .then((content: CmsContent) => setCmsHospital(content.hospital))
      .catch(() => undefined);
  }, []);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand" aria-label="N.P.N. Care Hospital home">
          <span className="brand-mark">N</span>
          <span>
            <strong>{displayHospital.name}</strong>
            <small>Ayurveda | Naturopathy | Electro Homeopathy</small>
          </span>
        </Link>

        <div className="header-menu-actions">
          <Link className="login-pill" href="/admin/login">
            <LogIn size={18} />
            <span>Login</span>
          </Link>
          <button
            className="icon-button mobile-menu-button"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu size={22} />
          </button>
        </div>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      {open ? (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="drawer-shell">
            <div className="drawer-brand-card">
              <div className="drawer-brand">
                <span className="brand-mark">N</span>
                <span>
                  <strong>{displayHospital.name}</strong>
                  <small>Natural healing with professional healthcare guidance</small>
                </span>
              </div>
              <span className="drawer-badge">
                <Leaf size={15} />
                Premium Care
              </span>
            </div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
            <nav className="drawer-nav" aria-label="Primary navigation">
              {navItems.map((item) => {
                const meta = navMeta[item.label] ?? { icon: Sparkles, description: "Open this patient care section." };
                const Icon = meta.icon;
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

                return (
                  <Link className={active ? "drawer-link active" : "drawer-link"} key={item.href} href={item.href} onClick={() => setOpen(false)}>
                    <span className="drawer-link-icon">
                      <Icon size={21} />
                    </span>
                    <span className="drawer-link-copy">
                      <strong>{item.label}</strong>
                      <small>{meta.description}</small>
                    </span>
                    <ChevronRight className="drawer-chevron" size={20} />
                  </Link>
                );
              })}
            </nav>

            <div className="drawer-trust" aria-label="Trust highlights">
              <span>
                <ShieldCheck size={16} />
                24x7 Support
              </span>
              <span>
                <HeartPulse size={16} />
                Experienced Doctors
              </span>
            </div>

            <div className="mobile-contact" aria-label="Quick actions">
              <span className="drawer-section-title">Quick Actions</span>
              <Link className="button button-primary" href="/#appointment" onClick={() => setOpen(false)}>
                <CalendarCheck size={18} />
                Book Appointment
              </Link>
              <Link className="button button-quiet" href={`https://wa.me/${displayHospital.whatsapp.replace(/\D/g, "")}`}>
                <MessageCircle size={18} />
                WhatsApp Support
              </Link>
              <Link className="button button-urgent" href={`tel:${displayHospital.emergency}`}>
                <Ambulance size={18} />
                Emergency Call
              </Link>
            </div>

            <div className="drawer-footer">
              <span>Follow care updates</span>
              <div>
                <a href="#" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="#" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="#" aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
