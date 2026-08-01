import { unstable_noStore as noStore } from "next/cache";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  Activity,
  Baby,
  Bone,
  Brain,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Droplets,
  FileHeart,
  HeartPulse,
  Leaf,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  Waves,
  type LucideIcon
} from "lucide-react";
import {
  adminModules,
  blogPosts,
  cmsAreas,
  conditionGroups,
  departments,
  doctors,
  faqs,
  gallery,
  hospital,
  journey,
  navItems,
  patientHindiHighlights,
  patientSchemes,
  testimonials,
  treatments,
  trustStats,
  values
} from "@/lib/content";
import type { HospitalGalleryImage } from "@/lib/gallery-shared";

export type IconKey =
  | "activity"
  | "baby"
  | "bone"
  | "brain"
  | "building"
  | "calendar"
  | "check"
  | "droplets"
  | "fileHeart"
  | "heart"
  | "leaf"
  | "message"
  | "shield"
  | "sparkles"
  | "stethoscope"
  | "users"
  | "video"
  | "waves";

export type CmsIconItem = {
  iconKey: IconKey;
};

export type CmsVideoItem = {
  id?: string;
  title: string;
  category: string;
  description: string;
  url: string;
  thumbnail: string;
  featured: boolean;
};

export type CmsContent = {
  hospital: typeof hospital;
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryButton: string;
    secondaryButton: string;
    locationLabel: string;
  };
  navigation: typeof navItems;
  footer: {
    description: string;
    exploreLinks: Array<{ label: string; href: string }>;
    bottomLeft: string;
    bottomRight: string;
  };
  careers: {
    heroTitle: string;
    heroText: string;
    primaryButton: string;
    secondaryButton: string;
    openingsEyebrow: string;
    openingsTitle: string;
    openings: Array<{ title: string; text: string }>;
    benefitsEyebrow: string;
    benefitsTitle: string;
    benefits: string[];
    cultureEyebrow: string;
    cultureTitle: string;
    cultureCards: Array<{ title: string; text: string }>;
    quoteEyebrow: string;
    quoteTitle: string;
    quoteText: string;
    applicationEyebrow: string;
    applicationTitle: string;
    applicationStatusTitle: string;
    applicationStatusText: string;
    statusList: string[];
    faqEyebrow: string;
    faqTitle: string;
    faqs: Array<{ q: string; a: string }>;
  };
  homepage: {
    whyEyebrow: string;
    whyTitle: string;
    whyText: string;
    philosophyEyebrow: string;
    philosophyTitle: string;
    philosophyText: string;
    philosophyBullets: string[];
    aboutEyebrow: string;
    aboutTitle: string;
    aboutLead: string;
    aboutBullets: string[];
    missionTitle: string;
    missionText: string;
    visionTitle: string;
    visionText: string;
    statsTitle: string;
    schemesTitle: string;
    schemesText: string;
    responsibleTitle: string;
    responsibleText: string;
    departmentsTitle: string;
    departmentsText: string;
    conditionTitle: string;
    conditionText: string;
    treatmentsTitle: string;
    treatmentsText: string;
    doctorsTitle: string;
    journeyTitle: string;
    storiesTitle: string;
    galleryTitle: string;
    facilitiesTitle: string;
    facilitiesText: string;
    toolsTitle: string;
    toolsText: string;
    videoTitle: string;
    blogTitle: string;
    faqTitle: string;
    appointmentTitle: string;
    appointmentText: string;
    contactTitle: string;
  };
  trustStats: typeof trustStats;
  values: Array<Omit<(typeof values)[number], "icon"> & CmsIconItem>;
  departments: Array<Omit<(typeof departments)[number], "icon"> & CmsIconItem>;
  facilities: Array<{ name: string; summary: string } & CmsIconItem>;
  treatments: Array<Omit<(typeof treatments)[number], "icon"> & CmsIconItem>;
  doctors: typeof doctors;
  patientSchemes: Array<Omit<(typeof patientSchemes)[number], "icon"> & CmsIconItem>;
  conditionGroups: typeof conditionGroups;
  patientHindiHighlights: typeof patientHindiHighlights;
  journey: typeof journey;
  testimonials: typeof testimonials;
  faqs: typeof faqs;
  blogPosts: typeof blogPosts;
  gallery: typeof gallery;
  galleryImages: HospitalGalleryImage[];
  videoTitles: Array<string | CmsVideoItem>;
  adminModules: Array<Omit<(typeof adminModules)[number], "icon"> & CmsIconItem>;
  cmsAreas: typeof cmsAreas;
};

const cmsPath = path.join(process.cwd(), "data", "cms.json");

export const iconMap: Record<IconKey, LucideIcon> = {
  activity: Activity,
  baby: Baby,
  bone: Bone,
  brain: Brain,
  building: Building2,
  calendar: CalendarCheck,
  check: CheckCircle2,
  droplets: Droplets,
  fileHeart: FileHeart,
  heart: HeartPulse,
  leaf: Leaf,
  message: MessageCircle,
  shield: ShieldCheck,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  users: Users,
  video: Video,
  waves: Waves
};

export function getIcon(iconKey: IconKey): LucideIcon {
  return iconMap[iconKey] ?? Leaf;
}

function valueIconKey(title: string): IconKey {
  if (title.includes("Patient")) return "heart";
  if (title.includes("Responsible")) return "shield";
  if (title.includes("Accessible")) return "users";
  return "leaf";
}

function departmentIconKey(name: string): IconKey {
  if (name.includes("Naturopathy")) return "waves";
  if (name.includes("Electro")) return "sparkles";
  if (name.includes("Pain")) return "bone";
  if (name.includes("Lifestyle")) return "activity";
  if (name.includes("Family")) return "baby";
  return "leaf";
}

function treatmentIconKey(title: string): IconKey {
  if (title.includes("Joint") || title.includes("Back") || title.includes("Spine")) return "bone";
  if (title.includes("Diabetes") || title.includes("Kidney") || title.includes("Urinary")) return "droplets";
  if (title.includes("Heart") || title.includes("Women")) return "heart";
  if (title.includes("Migraine") || title.includes("Nerve")) return "brain";
  if (title.includes("Thyroid")) return "sparkles";
  if (title.includes("Cancer") || title.includes("Paralysis")) return "shield";
  if (title.includes("Digestive")) return "fileHeart";
  return "activity";
}

function schemeIconKey(title: string): IconKey {
  if (title.includes("Free")) return "users";
  if (title.includes("Insurance")) return "fileHeart";
  if (title.includes("Assurance")) return "shield";
  return "stethoscope";
}

function facilityIconKey(name: string): IconKey {
  if (name.includes("Reception")) return "building";
  if (name.includes("Consultation")) return "stethoscope";
  if (name.includes("Therapy")) return "waves";
  if (name.includes("Wellness")) return "leaf";
  if (name.includes("Pharmacy")) return "fileHeart";
  if (name.includes("Lounge")) return "users";
  if (name.includes("Equipment")) return "sparkles";
  return "shield";
}

function adminIconKey(title: string): IconKey {
  if (title.includes("Appointment")) return "calendar";
  if (title.includes("Doctor")) return "stethoscope";
  if (title.includes("Treatment")) return "leaf";
  if (title.includes("Gallery")) return "building";
  if (title.includes("Video")) return "video";
  if (title.includes("Review")) return "message";
  if (title.includes("SEO")) return "check";
  return "users";
}

export function getDefaultCmsContent(): CmsContent {
  return {
    hospital: {
      ...hospital,
      hindiName: "\u090f\u0928. \u092a\u0940. \u090f\u0928. \u0915\u0947\u092f\u0930 \u0939\u0949\u0938\u094d\u092a\u093f\u091f\u0932"
    },
    hero: {
      eyebrow: `${hospital.legalName} | Reg. No. ${hospital.registrationNo}`,
      title: "Healing Beyond Medicine",
      subtitle:
        "Personalized healthcare combining natural therapies with experienced medical guidance.",
      primaryButton: "Book Appointment",
      secondaryButton: "Talk to Doctor",
      locationLabel: "Gorei, Iglas, Aligarh"
    },
    navigation: navItems,
    footer: {
      description:
        "Premium, patient-first Ayurveda, Naturopathy, Electro Homeopathy, and Integrative Healthcare for families, senior citizens, insured patients, and eligible low-income families.",
      exploreLinks: [
        { label: "Careers / Apply Now", href: "/careers" },
        { label: "Digital Agreement", href: "/agreement" },
        { label: "Gallery", href: "/gallery" },
        { label: "Contact", href: "/contact" }
      ],
      bottomLeft: `Copyright ${new Date().getFullYear()} ${hospital.name}. All rights reserved.`,
      bottomRight: "Privacy | Terms | Accessibility"
    },
    careers: {
      heroTitle: "Join Our Team",
      heroText:
        "Build a meaningful healthcare career with a hospital focused on professional care, natural healing, and patient dignity.",
      primaryButton: "Apply Now",
      secondaryButton: "View Openings",
      openingsEyebrow: "Current Openings",
      openingsTitle: "Roles designed around patient care and professional growth.",
      openings: [
        { title: "Receptionist", text: "Front desk coordination, patient guidance, calls, and appointment support." },
        { title: "Naturopathy Therapist", text: "Therapy room support, patient care routines, and wellness program assistance." },
        { title: "Patient Care Coordinator", text: "Help patients understand visits, documents, follow-ups, and care schedules." },
        { title: "Admin Executive", text: "Support records, communication, operations, and hiring coordination." }
      ],
      benefitsEyebrow: "Benefits",
      benefitsTitle: "A calm workplace with clear systems and human care.",
      benefits: [
        "Calm healthcare workplace",
        "Patient-first team culture",
        "Training and growth support",
        "Respectful communication",
        "Organized digital workflow",
        "Purpose-led natural healing"
      ],
      cultureEyebrow: "Hospital Culture",
      cultureTitle: "Professional healthcare with natural healing values.",
      cultureCards: [
        { title: "Patient dignity first", text: "Every role supports clear guidance, respectful communication, and practical help for families." },
        { title: "Modern systems", text: "Digital applications, appointment queues, content tools, and admin workflows keep the work organized." }
      ],
      quoteEyebrow: "Employee Voice",
      quoteTitle: "\"The hospital feels organized, calm, and personal.\"",
      quoteText: "Team members are encouraged to learn, communicate clearly, and contribute to better patient experience.",
      applicationEyebrow: "Application Form",
      applicationTitle: "Submit your job application securely.",
      applicationStatusTitle: "Application Status",
      applicationStatusText: "After submission, each applicant receives an Application ID, submitted date, and current status.",
      statusList: ["Received", "Under Review", "Interview", "Selected", "Rejected"],
      faqEyebrow: "Career FAQ",
      faqTitle: "Answers before you apply.",
      faqs: [
        { q: "Can freshers apply?", a: "Yes. Some roles are open to freshers with good communication, discipline, and willingness to learn." },
        { q: "Which resume formats are accepted?", a: "PDF, DOC, and DOCX files up to 5 MB are accepted." },
        { q: "How will I know my status?", a: "You receive an application ID after submission. The admin team reviews and updates the application status." },
        { q: "Can I apply for multiple roles?", a: "Please submit one application for the role that best matches your experience." }
      ]
    },
    homepage: {
      whyEyebrow: "Why Choose Us",
      whyTitle: "Why patients choose N.P.N. Care Hospital.",
      whyText:
        "Modern care should feel easy to understand, respectful to the family, and guided by doctors who look beyond symptoms.",
      philosophyEyebrow: "Our Philosophy",
      philosophyTitle: "Professional healthcare with natural healing.",
      philosophyText:
        "N.P.N. Care Hospital believes recovery begins when patients understand their body, their reports, their daily habits, and the treatment path ahead. We combine natural therapies with experienced medical guidance so care feels calm, personal, and practical.",
      philosophyBullets: [
        "Listen first, then design a care plan around the patient.",
        "Use natural therapies responsibly with medical history and reports.",
        "Support long-term wellness through follow-up, routines, and prevention."
      ],
      aboutEyebrow: "About Hospital",
      aboutTitle: "A modern destination for natural and integrative healing.",
      aboutLead:
        "N.P.N. Care Hospital brings together Ayurveda, Naturopathy, Electro Homeopathy, lifestyle guidance, and compassionate clinical review so patients can understand their health and make confident care decisions.",
      aboutBullets: [
        "Treatment plans are personalized to medical history, reports, age, lifestyle, and family needs.",
        "Pamphlet details are organized into simple sections for families, senior citizens, insured patients, and eligible low-income patients.",
        "Every service is presented clearly, without poster-style clutter or confusing medical language."
      ],
      missionTitle: "To make natural and integrative care more accessible for everyday families.",
      missionText:
        "We help patients move from symptom confusion to a clear care pathway built around consultation, therapy, documentation, and follow-up.",
      visionTitle: "To build a trusted N.P.N. Care Hospital network across India.",
      visionText:
        "The pamphlet mentions more than 18 hospitals across India; the website turns that ambition into a modern digital healthcare experience.",
      statsTitle: "Trust signals that help patients feel confident immediately.",
      schemesTitle: "Important schemes and notices made simple for patients.",
      schemesText:
        "The original pamphlet information is converted into clear, patient-friendly cards so families can understand support schemes without reading a crowded poster.",
      responsibleTitle: "No medical promise is shown without consultation.",
      responsibleText:
        "Treatment suitability, written terms, insurance approval, refund rules, and expected outcomes must be confirmed with the hospital team during registration.",
      departmentsTitle: "Integrated healthcare departments for whole-person care.",
      departmentsText: "Each department is designed as a care pathway, not just a service name.",
      conditionTitle: "A clearer directory of the health concerns patients ask about.",
      conditionText: "Patients can start from common symptoms or disease areas, then speak with a doctor before beginning any treatment plan.",
      treatmentsTitle: "Condition-focused treatment cards for fast understanding.",
      treatmentsText: "Patients can browse by condition, understand the pathway, and request the right appointment quickly.",
      doctorsTitle: "Doctor profiles from the pamphlet, presented professionally.",
      journeyTitle: "A guided path from first call to long-term wellness.",
      storiesTitle: "Real outcomes presented with dignity and clarity.",
      galleryTitle: "Types of facilities, and community presence.",
      facilitiesTitle: "Hospital facilities designed for calm, safe visits.",
      facilitiesText:
        "From reception to therapy rooms, every patient touchpoint is presented as a clean, comfortable, and professional healthcare environment.",
      toolsTitle: "Find the right next step in seconds.",
      toolsText:
        "Search doctors, match a treatment, calculate BMI, switch language, and use accessibility controls before booking.",
      videoTitle: "Education, patient awareness, and doctor guidance.",
      blogTitle: "SEO-ready health education for patients and families.",
      faqTitle: "Simple answers for patients who need confidence before visiting.",
      appointmentTitle: "A calm, fast booking experience for every patient.",
      appointmentText:
        "Share your preferred treatment, doctor, date, and time. The care desk can route your request to the right department and confirm by phone or WhatsApp.",
      contactTitle: "Reach the hospital quickly."
    },
    trustStats,
    values: values.map(({ icon: _icon, ...item }) => ({ ...item, iconKey: valueIconKey(item.title) })),
    departments: departments.map(({ icon: _icon, ...item }) => ({ ...item, iconKey: departmentIconKey(item.name) })),
    facilities: gallery.map((name) => ({
      name,
      summary:
        name === "Reception"
          ? "A calm arrival area for registration, support, and first guidance."
          : name === "Consultation"
            ? "Private consultation spaces for doctor-led history review and care planning."
            : name === "Therapy Rooms"
              ? "Comfortable therapy rooms for naturopathy, pain care, and recovery support."
              : name === "Wellness Spaces"
                ? "Quiet wellness areas that support natural healing and patient comfort."
                : name === "Pharmacy"
                  ? "Medicine support with clear guidance from the hospital care team."
                  : name === "Patient Lounge"
                    ? "Seating and waiting space designed for patients and families."
                    : name === "Modern Equipment"
                      ? "Organized equipment zones that support clean and efficient patient care."
                      : "A hygienic environment maintained for patient confidence and safety.",
      iconKey: facilityIconKey(name)
    })),
    treatments: treatments.map(({ icon: _icon, ...item }) => ({ ...item, iconKey: treatmentIconKey(item.title) })),
    doctors,
    patientSchemes: patientSchemes.map(({ icon: _icon, ...item }) => ({ ...item, iconKey: schemeIconKey(item.title) })),
    conditionGroups,
    patientHindiHighlights,
    journey,
    testimonials,
    faqs,
    blogPosts,
    gallery,
    galleryImages: [],
    videoTitles: ["Doctor Explains Chronic Care", "Patient Recovery Story", "Daily Wellness Tips"],
    adminModules: adminModules.map(({ icon: _icon, ...item }) => ({ ...item, iconKey: adminIconKey(item.title) })),
    cmsAreas
  };
}

function mergeCmsContent(data: Partial<CmsContent>): CmsContent {
  const defaults = getDefaultCmsContent();

  return {
    ...defaults,
    ...data,
    hospital: { ...defaults.hospital, ...(data.hospital ?? {}) },
    hero: { ...defaults.hero, ...(data.hero ?? {}) },
    navigation: data.navigation ?? defaults.navigation,
    footer: {
      ...defaults.footer,
      ...(data.footer ?? {}),
      exploreLinks: data.footer?.exploreLinks ?? defaults.footer.exploreLinks
    },
    careers: {
      ...defaults.careers,
      ...(data.careers ?? {}),
      openings: data.careers?.openings ?? defaults.careers.openings,
      benefits: data.careers?.benefits ?? defaults.careers.benefits,
      cultureCards: data.careers?.cultureCards ?? defaults.careers.cultureCards,
      statusList: data.careers?.statusList ?? defaults.careers.statusList,
      faqs: data.careers?.faqs ?? defaults.careers.faqs
    },
    homepage: { ...defaults.homepage, ...(data.homepage ?? {}) },
    facilities: data.facilities ?? defaults.facilities,
    galleryImages: data.galleryImages ?? defaults.galleryImages
  };
}

export async function getCmsContent(): Promise<CmsContent> {
  noStore();

  try {
    const raw = await readFile(cmsPath, "utf8");
    return mergeCmsContent(JSON.parse(raw) as Partial<CmsContent>);
  } catch {
    const defaults = getDefaultCmsContent();
    await saveCmsContent(defaults);
    return defaults;
  }
}

export async function saveCmsContent(content: CmsContent): Promise<CmsContent> {
  const merged = mergeCmsContent(content);
  await mkdir(path.dirname(cmsPath), { recursive: true });
  await writeFile(cmsPath, `${JSON.stringify(merged, null, 2)}\n`, "utf8");
  return merged;
}
