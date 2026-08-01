"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import {
  Baby,
  Bone,
  Brain,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  Droplets,
  FileQuestion,
  FileSignature,
  HeartPulse,
  Home,
  Images,
  Info,
  Leaf,
  LogIn,
  Menu,
  MessageCircle,
  Newspaper,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
  Waves,
  X,
  type LucideIcon
} from "lucide-react";
import {
  departments as defaultDepartments,
  doctors as defaultDoctors,
  hospital,
  treatments as defaultTreatments
} from "@/lib/content";
import type { CmsContent, IconKey } from "@/lib/cms";

type MegaItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  action?: string;
};

const primaryNavItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Treatments", href: "/treatments" },
  { label: "Doctors", href: "/doctors" },
  { label: "Patient Stories", href: "/#stories" },
  { label: "Gallery", href: "/gallery" },
  { label: "Blogs", href: "/blog" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" }
];

const patientCornerItems: MegaItem[] = [
  { title: "Book Appointment", description: "Request a visit and receive care desk confirmation.", href: "/#appointment", icon: CalendarCheck },
  { title: "Agreement Form", description: "Complete the secure digital patient agreement.", href: "/agreement", icon: FileSignature },
  { title: "Patient Testimonials", description: "Read real patient stories and care experiences.", href: "/#stories", icon: Users },
  { title: "Health Articles", description: "Simple wellness guidance from the hospital team.", href: "/blog", icon: Newspaper },
  { title: "FAQs", description: "Find answers about visits, documents, timings, and care.", href: "/faqs", icon: FileQuestion },
  { title: "Insurance", description: "Ask the desk about policy support and eligibility.", href: "/schemes", icon: ShieldCheck }
];

const mobileDescriptions: Record<string, string> = {
  Home: "Start from the hospital overview.",
  About: "Mission, philosophy, and care promise.",
  Treatments: "Natural and integrative care pathways.",
  Doctors: "Meet the doctor team.",
  "Patient Stories": "Patient recovery experiences.",
  Gallery: "Hospital photos and videos.",
  Blogs: "Wellness guidance and articles.",
  Careers: "Apply for hospital roles.",
  Contact: "Location, phone, and timings.",
  Agreement: "Digital consent and patient form."
};

const defaultFacilities: Array<{ name: string; summary: string; iconKey: IconKey }> = [
  { name: "Reception", summary: "A calm arrival area for registration, support, and first guidance.", iconKey: "building" },
  { name: "Consultation Rooms", summary: "Private consultation spaces for doctor-led history review and care planning.", iconKey: "stethoscope" },
  { name: "Therapy Rooms", summary: "Comfortable therapy rooms for naturopathy, pain care, and recovery support.", iconKey: "waves" },
  { name: "Wellness Spaces", summary: "Quiet wellness areas that support natural healing and patient comfort.", iconKey: "leaf" },
  { name: "Pharmacy", summary: "Medicine support with clear guidance from the hospital care team.", iconKey: "fileHeart" },
  { name: "Patient Lounge", summary: "Seating and waiting space designed for patients and families.", iconKey: "users" }
];

const iconMap: Record<IconKey, LucideIcon> = {
  activity: HeartPulse,
  baby: Baby,
  bone: Bone,
  brain: Brain,
  building: Building2,
  calendar: CalendarCheck,
  check: ShieldCheck,
  droplets: Droplets,
  fileHeart: FileSignature,
  heart: HeartPulse,
  leaf: Leaf,
  message: MessageCircle,
  shield: ShieldCheck,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  users: Users,
  video: Images,
  waves: Waves
};

function getIcon(iconKey?: IconKey): LucideIcon {
  return iconKey ? iconMap[iconKey] ?? Sparkles : Sparkles;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href.startsWith("/#")) return pathname === "/";
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);
  const [content, setContent] = useState<CmsContent | null>(null);
  const pathname = usePathname();
  const { scrollY } = useScroll();

  const displayHospital = content?.hospital ?? hospital;
  const departments = content?.departments ?? defaultDepartments;
  const treatments = content?.treatments ?? defaultTreatments;
  const doctors = content?.doctors ?? defaultDoctors;
  const facilities = content?.facilities ?? defaultFacilities;

  useMotionValueEvent(scrollY, "change", (latest) => {
    setCompact(latest > 32);
  });

  useEffect(() => {
    setIntroSeen(window.sessionStorage.getItem("npn-intro-played") === "true");
    fetch("/api/cms", { cache: "no-store" })
      .then((response) => response.json())
      .then((cmsContent: CmsContent) => setContent(cmsContent))
      .catch(() => undefined);
  }, []);

  const megaMenus = useMemo(() => {
    const departmentItems: MegaItem[] = departments.slice(0, 6).map((item) => {
      const Icon = getIcon("iconKey" in item ? item.iconKey : undefined);
      return {
        title: item.name,
        description: item.summary,
        href: `/treatments?department=${encodeURIComponent(item.name)}`,
        icon: Icon,
        action: "View More"
      };
    });

    const treatmentItems: MegaItem[] = treatments.slice(0, 10).map((item) => {
      const Icon = getIcon("iconKey" in item ? item.iconKey : undefined);
      return {
        title: item.title,
        description: item.summary,
        href: `/treatments/${item.slug}`,
        icon: Icon,
        action: "View Treatment"
      };
    });

    const doctorItems: MegaItem[] = doctors.slice(0, 4).map((doctor) => ({
      title: doctor.name,
      description: `${doctor.qualification} | ${doctor.experience}. ${doctor.specialization}`,
      href: "/#appointment",
      icon: UserRound,
      action: "Book Appointment"
    }));

    const facilityItems: MegaItem[] = facilities.slice(0, 6).map((item) => {
      const Icon = getIcon("iconKey" in item ? item.iconKey : undefined);
      return {
        title: item.name,
        description: item.summary,
        href: "/facilities",
        icon: Icon,
        action: "View More"
      };
    });

    return {
      Departments: departmentItems,
      Treatments: treatmentItems,
      Doctors: doctorItems,
      Facilities: facilityItems,
      "Patient Corner": patientCornerItems
    };
  }, [departments, doctors, facilities, treatments]);

  const bottomNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Departments", href: "/departments", icon: Building2, items: megaMenus.Departments },
    { label: "Treatments", href: "/treatments", icon: HeartPulse, items: megaMenus.Treatments },
    { label: "Doctors", href: "/doctors", icon: Stethoscope, items: megaMenus.Doctors },
    { label: "Facilities", href: "/facilities", icon: Images, items: megaMenus.Facilities },
    { label: "Patient Corner", href: "/#appointment", icon: Users, items: megaMenus["Patient Corner"] },
    { label: "Agreement", href: "/agreement", icon: FileSignature },
    { label: "Gallery", href: "/gallery", icon: Images },
    { label: "Blog", href: "/blog", icon: Newspaper },
    { label: "Contact", href: "/contact", icon: Phone }
  ];

  const drawerItems = [
    ...primaryNavItems,
    { label: "Agreement", href: "/agreement" }
  ];

  return (
    <>
      <motion.header
        className={compact ? "site-header-shell compact" : "site-header-shell"}
        initial={introSeen === null ? false : { opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, delay: introSeen ? 0.04 : 2.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="site-header-top">
          <Link href="/" className="header-brand" aria-label="N.P.N. Care Hospital home">
            <span className="header-brand-mark">N</span>
            <span className="header-brand-copy">
              <strong className="header-brand-primary">N.P.N</strong>
              <span className="header-brand-secondary">CARE HOSPITAL</span>
              <small>Ayurveda <span>|</span> Naturopathy <span>|</span> Electro Homeopathy</small>
            </span>
          </Link>

          <nav className="top-primary-nav" aria-label="Primary navigation">
            {primaryNavItems.map((item, index) => (
              <Link
                className={isActive(pathname, item.href) ? "active" : ""}
                href={item.href}
                key={item.label}
                style={{ "--nav-index": index } as React.CSSProperties}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-action-cluster" aria-label="Header actions">
            <Link className="header-icon-action search-action" href="/blog" aria-label="Search health articles">
              <Search size={20} />
            </Link>
            <Link className="header-pill-action emergency-action" href={`tel:${displayHospital.emergency}`}>
              <Phone size={17} />
              <span>Emergency</span>
            </Link>
            <Link className="header-pill-action call-action" href={`tel:${displayHospital.phone}`}>
              <Phone size={17} />
              <span>Call</span>
            </Link>
            <Link className="header-pill-action login-action" href="/admin/login">
              <LogIn size={17} />
              <span>Login</span>
            </Link>
            <Link className="header-book-cta" href="/#appointment">
              <CalendarCheck size={18} />
              <span>Book Appointment</span>
            </Link>
            <button
              className="header-icon-action mobile-menu-button"
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Menu size={23} />
            </button>
          </div>
        </div>

        <div className="site-header-bottom">
          <nav className="service-nav" aria-label="Service navigation">
            {bottomNavItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <div className="service-nav-item" key={item.label} style={{ "--nav-index": index } as React.CSSProperties}>
                  <Link className={active ? "service-nav-link active" : "service-nav-link"} href={item.href}>
                    <Icon size={17} />
                    {item.label}
                    {item.items ? <ChevronDown size={15} /> : null}
                  </Link>
                  {item.items ? (
                    <div className="mega-menu" role="menu">
                      <div className="mega-menu-heading">
                        <span className="mega-menu-icon">
                          <Icon size={22} />
                        </span>
                        <div>
                          <strong>{item.label}</strong>
                          <small>Choose a care pathway and continue with confidence.</small>
                        </div>
                      </div>
                      <div className={item.label === "Doctors" ? "mega-menu-grid doctor-mega-grid" : "mega-menu-grid"}>
                        {item.items.map((megaItem) => {
                          const MegaIcon = megaItem.icon;
                          return (
                            <Link className="mega-card" href={megaItem.href} key={`${item.label}-${megaItem.title}`} role="menuitem">
                              <span className="mega-card-icon">
                                <MegaIcon size={21} />
                              </span>
                              <span className="mega-card-copy">
                                <strong>{megaItem.title}</strong>
                                <small>{megaItem.description}</small>
                                <em>{megaItem.action ?? "View More"} <ChevronRight size={14} /></em>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </nav>
        </div>
      </motion.header>

      {open ? (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="drawer-shell">
            <div className="drawer-brand-card">
              <div className="drawer-brand">
                <span className="header-brand-mark">N</span>
                <span>
                  <strong>N.P.N</strong>
                  <em>CARE HOSPITAL</em>
                  <small>Premium natural healthcare guidance</small>
                </span>
              </div>
              <span className="drawer-badge">
                <ShieldCheck size={15} />
                Trusted Care
              </span>
            </div>
            <button className="icon-button" type="button" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
            <nav className="drawer-nav" aria-label="Primary navigation">
              {drawerItems.map((item, index) => {
                const metaIcon =
                  item.label === "Home" ? Home :
                  item.label === "About" ? Info :
                  item.label === "Treatments" ? HeartPulse :
                  item.label === "Doctors" ? Stethoscope :
                  item.label === "Patient Stories" ? Users :
                  item.label === "Careers" ? BriefcaseBusiness :
                  item.label === "Agreement" ? FileSignature :
                  item.label === "Gallery" ? Images :
                  item.label === "Blogs" ? Newspaper :
                  Phone;
                const active = isActive(pathname, item.href);
                const Icon = metaIcon;

                return (
                  <Link
                    className={active ? "drawer-link active" : "drawer-link"}
                    href={item.href}
                    key={item.label}
                    onClick={() => setOpen(false)}
                    style={{ "--nav-index": index } as React.CSSProperties}
                  >
                    <span className="drawer-link-icon">
                      <Icon size={21} />
                    </span>
                    <span className="drawer-link-copy">
                      <strong>{item.label}</strong>
                      <small>{mobileDescriptions[item.label] ?? "Open this section."}</small>
                    </span>
                    <ChevronRight className="drawer-chevron" size={20} />
                  </Link>
                );
              })}
            </nav>

            <div className="drawer-trust" aria-label="Trust highlights">
              <span>
                <ShieldCheck size={16} />
                24/7 Support
              </span>
              <span>
                <Stethoscope size={16} />
                Experienced Doctors
              </span>
            </div>

            <div className="mobile-contact" aria-label="Quick actions">
              <span className="drawer-section-title">Quick Actions</span>
              <Link className="button button-primary" href="/#appointment" onClick={() => setOpen(false)}>
                <CalendarCheck size={18} />
                Book Appointment
              </Link>
              <Link className="button button-urgent" href={`tel:${displayHospital.emergency}`}>
                <Phone size={18} />
                Emergency Call
              </Link>
              <Link className="button button-quiet" href={`https://wa.me/${displayHospital.whatsapp.replace(/\D/g, "")}`}>
                <MessageCircle size={18} />
                WhatsApp Support
              </Link>
            </div>

          </div>
        </div>
      ) : null}
    </>
  );
}
