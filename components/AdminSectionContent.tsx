import Link from "next/link";
import {
  BarChart3,
  Bell,
  FileText,
  LockKeyhole,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { AdminAgreementManager } from "@/components/AdminAgreementManager";
import { AdminAiManager } from "@/components/AdminAiManager";
import { AdminAppointmentManager } from "@/components/AdminAppointmentManager";
import { AdminBlogManager } from "@/components/AdminBlogManager";
import { AdminCareerApplications } from "@/components/AdminCareerApplications";
import { AdminCmsEditor } from "@/components/AdminCmsEditor";
import { AdminGalleryUploader } from "@/components/AdminGalleryUploader";
import { AdminTestimonialsManager } from "@/components/AdminTestimonialsManager";
import { AdminVideoManager } from "@/components/AdminVideoManager";
import { CmsIcon } from "@/components/CmsIcon";
import { getAppointments } from "@/lib/appointments";
import { getAgreements } from "@/lib/agreements";
import { getAssistantAnalytics, getAssistantConversations, getAssistantDocuments } from "@/lib/ai-assistant";
import { getCareerApplications } from "@/lib/careers";
import { getCmsContent } from "@/lib/cms";
import { prisma } from "@/lib/prisma";
import { getTestimonials } from "@/lib/testimonials";

export const adminSectionSlugs = [
  "appointments",
  "agreements",
  "careers",
  "ai-assistant",
  "doctors",
  "departments",
  "facilities",
  "treatments",
  "blogs",
  "gallery",
  "videos",
  "testimonials",
  "faqs",
  "seo",
  "analytics",
  "users",
  "roles",
  "permissions",
  "settings"
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function AdminSection({
  eyebrow,
  title,
  text,
  children
}: {
  eyebrow: string;
  title: string;
  text?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-section page-section">
      <div className="section-heading">
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {text ? <p>{text}</p> : null}
      </div>
      {children}
    </section>
  );
}

async function getLiveUserCount() {
  if (!process.env.DATABASE_URL) return 1;

  try {
    return await prisma.user.count({ where: { active: true } });
  } catch {
    return 1;
  }
}

function getSeoPageCount(content: Awaited<ReturnType<typeof getCmsContent>>) {
  const customerPages = 13;
  return customerPages + content.treatments.length + content.blogPosts.length;
}

export async function AdminDashboardContent() {
  const content = await getCmsContent();
  const appointments = await getAppointments();
  const agreements = await getAgreements();
  const careerApplications = await getCareerApplications();
  const aiConversations = await getAssistantConversations();
  const testimonials = await getTestimonials();
  const userCount = await getLiveUserCount();
  const { blogPosts, doctors, galleryImages, treatments, videoTitles } = content;

  const modules = [
    { title: "Appointments", value: String(appointments.length), iconKey: "calendar" as const },
    { title: "Doctors", value: String(doctors.length), iconKey: "stethoscope" as const },
    { title: "Treatments", value: String(treatments.length), iconKey: "leaf" as const },
    { title: "Gallery Images", value: String(galleryImages.length), iconKey: "building" as const },
    { title: "Videos", value: String(videoTitles.length), iconKey: "video" as const },
    { title: "Testimonials", value: String(testimonials.length), iconKey: "message" as const },
    { title: "Blog Posts", value: String(blogPosts.length), iconKey: "fileHeart" as const },
    { title: "SEO Pages", value: String(getSeoPageCount(content)), iconKey: "check" as const },
    { title: "Users", value: String(userCount), iconKey: "users" as const },
    { title: "Agreements", value: String(agreements.length), iconKey: "fileHeart" as const },
    { title: "Career Applications", value: String(careerApplications.length), iconKey: "users" as const },
    { title: "AI Conversations", value: String(aiConversations.length), iconKey: "message" as const }
  ];

  return (
    <section>
      <div className="dashboard-top">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h1>Manage the full hospital platform.</h1>
          <p className="lead">Use the sidebar to open each workspace as a separate page. Customer-facing pages read CMS content dynamically.</p>
        </div>
        <div className="hero-actions">
          <Link className="icon-button" href="/admin/settings" aria-label="Settings">
            <Settings size={18} />
          </Link>
          <Link className="button button-quiet" href="/admin/agreements">
            <FileText size={18} />
            Agreements
          </Link>
          <Link className="button button-primary" href="/admin/settings">
            <Plus size={18} />
            New Content
          </Link>
        </div>
      </div>

      <label>
        <span className="eyebrow">
          <Search size={17} />
          Search CMS
        </span>
        <input placeholder="Search appointments, doctors, treatments, media, testimonials, or SEO pages" />
      </label>

      <div className="grid grid-4" style={{ marginTop: 24 }}>
        {modules.map((module) => (
          <article className="dashboard-card" key={module.title}>
            <span className="module-icon">
              <CmsIcon iconKey={module.iconKey} />
            </span>
            <strong>{module.value}</strong>
            <p>{module.title}</p>
          </article>
        ))}
      </div>

      <div className="grid grid-3" style={{ marginTop: 24 }}>
        <article className="card">
          <Bell size={22} color="#0F172A" />
          <h3>Latest appointment</h3>
          <p>{appointments[0] ? `${appointments[0].name} requested ${appointments[0].treatment}.` : "No appointments yet."}</p>
        </article>
        <article className="card">
          <FileText size={22} color="#0F172A" />
          <h3>Agreement queue</h3>
          <p>{agreements.length ? `${agreements.length} agreement records available for review.` : "No agreements submitted yet."}</p>
        </article>
        <article className="card">
          <BarChart3 size={22} color="#0F172A" />
          <h3>Live customer sync</h3>
          <p>Use Settings for CMS edits. Public pages update from the same content source after refresh.</p>
        </article>
      </div>

    </section>
  );
}

export async function AdminSectionContent({ section }: { section: string }) {
  const content = await getCmsContent();
  const appointments = await getAppointments();
  const agreements = await getAgreements();
  const careerApplications = await getCareerApplications();
  const aiConversations = await getAssistantConversations();
  const aiDocuments = await getAssistantDocuments();
  const aiAnalytics = await getAssistantAnalytics();
  const managedTestimonials = await getTestimonials();
  const {
    blogPosts,
    cmsAreas,
    departments,
    doctors,
    facilities,
    faqs,
    gallery,
    galleryImages,
    treatments,
    videoTitles
  } = content;

  const analytics = [
    { label: "Website Pages", value: "36", iconKey: "building" as const },
    { label: "Appointments", value: String(appointments.length), iconKey: "calendar" as const },
    { label: "Agreements", value: String(agreements.length), iconKey: "fileHeart" as const },
    { label: "Job Applications", value: String(careerApplications.length), iconKey: "users" as const },
    { label: "AI Conversations", value: String(aiConversations.length), iconKey: "message" as const },
    { label: "Treatments", value: String(treatments.length), iconKey: "leaf" as const },
    { label: "Doctors", value: String(doctors.length), iconKey: "stethoscope" as const }
  ];

  const users = [
    { name: "Super Admin", email: "npncarehospital786@gmail.com", role: "SUPER_ADMIN", status: "Active" },
    { name: "Care Desk", email: "npncarehospital786@gmail.com", role: "ADMIN", status: "Active" },
    { name: "Doctor Team", email: "doctors@npncarehospital.com", role: "DOCTOR", status: "Pending setup" }
  ];

  if (section === "appointments") {
    return (
      <AdminSection eyebrow="Appointments" title="Patient appointment queue" text="Customer website appointment submissions are saved here automatically.">
        <AdminAppointmentManager appointments={appointments} doctors={doctors} />
      </AdminSection>
    );
  }

  if (section === "agreements") {
    return (
      <section className="admin-section page-section agreement-section-shell">
        <AdminAgreementManager agreements={agreements} departments={departments} doctors={doctors} />
      </section>
    );
  }

  if (section === "careers") {
    return (
      <AdminSection
        eyebrow="Careers"
        title="Manage job applications"
        text="Review applications, preview resumes, change status, export CSV, and manage hiring decisions from one protected admin module."
      >
        <AdminCareerApplications applications={careerApplications} />
        <AdminCmsEditor initialSection="careers" focusOnly />
      </AdminSection>
    );
  }

  if (section === "ai-assistant") {
    return (
      <AdminSection
        eyebrow="AI Management"
        title="Manage AI health assistant"
        text="Train approved knowledge, view encrypted conversations, monitor analytics, and identify questions that need staff follow-up."
      >
        <AdminAiManager conversations={aiConversations} documents={aiDocuments} analytics={aiAnalytics} />
      </AdminSection>
    );
  }

  if (section === "doctors") {
    return (
      <AdminSection eyebrow="Doctors" title="Manage doctor profiles">
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
              <Link className="button button-quiet" href="/admin/settings">
                Edit in CMS
              </Link>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="doctors" focusOnly />
      </AdminSection>
    );
  }

  if (section === "departments") {
    return (
      <AdminSection eyebrow="Departments" title="Manage departments">
        <IconGrid items={departments} nameKey="name" />
        <AdminCmsEditor initialSection="departments" focusOnly />
      </AdminSection>
    );
  }

  if (section === "facilities") {
    return (
      <AdminSection eyebrow="Facilities" title="Manage hospital facilities">
        <IconGrid items={facilities} nameKey="name" />
        <AdminCmsEditor initialSection="facilities" focusOnly />
      </AdminSection>
    );
  }

  if (section === "treatments") {
    return (
      <AdminSection eyebrow="Treatments" title="Manage treatment pages" text="Each treatment card has a matching customer detail page. Keep slugs unique when editing CMS.">
        <div className="grid grid-4">
          {treatments.map((treatment) => (
            <article className="treatment-card" key={treatment.slug}>
              <span className="treatment-icon">
                <CmsIcon iconKey={treatment.iconKey} size={23} />
              </span>
              <h3>{treatment.title}</h3>
              <p>{treatment.summary}</p>
              <Link className="card-link" href={`/treatments/${treatment.slug}`}>
                View public page
              </Link>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="treatments" focusOnly />
      </AdminSection>
    );
  }

  if (section === "blogs") {
    return (
      <AdminSection
        eyebrow="Blogs"
        title="Manage health blog content"
        text="Create articles, publish to the customer Knowledge Center, and prepare social media posts from one admin workflow."
      >
        <AdminBlogManager initialContent={content} />
      </AdminSection>
    );
  }

  if (section === "gallery") {
    const categoryImages = new Map(galleryImages.filter((image) => image.category).map((image) => [image.category as string, image]));

    return (
      <AdminSection eyebrow="Gallery" title="Manage gallery categories">
        <AdminGalleryUploader images={galleryImages} categories={gallery} />
        <div className="grid grid-3">
          {gallery.map((item) => {
            const image = categoryImages.get(item);
            return (
              <div className="media-tile" key={item} style={image ? { backgroundImage: `linear-gradient(145deg, rgba(15, 23, 42, 0.5), rgba(15, 23, 42, 0.18)), url(${image.src})` } : undefined}>
                {item}
              </div>
            );
          })}
        </div>
        <AdminCmsEditor initialSection="gallery" focusOnly />
      </AdminSection>
    );
  }

  if (section === "videos") {
    return (
      <AdminSection eyebrow="Videos" title="Manage video library" text="Add real video links, thumbnails, categories, and patient-friendly descriptions.">
        <AdminVideoManager initialContent={content} />
      </AdminSection>
    );
  }

  if (section === "testimonials") {
    return (
      <AdminSection eyebrow="Testimonials" title="Manage patient stories">
        <AdminTestimonialsManager testimonials={managedTestimonials} doctors={doctors} treatments={treatments} />
      </AdminSection>
    );
  }

  if (section === "faqs") {
    return (
      <AdminSection eyebrow="FAQs" title="Manage patient questions">
        <div className="grid grid-2">
          {faqs.map((faq) => (
            <article className="faq-item" key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="faqs" focusOnly />
      </AdminSection>
    );
  }

  if (section === "seo") {
    return (
      <AdminSection eyebrow="SEO" title="Manage SEO and search readiness">
        <div className="grid grid-4">
          {["Dynamic Meta Tags", "Schema Markup", "XML Sitemap", "Canonical URLs", "Open Graph", "Twitter Cards", "Robots.txt", "Treatment SEO Pages"].map((item) => (
            <article className="card" key={item}>
              <FileText size={22} color="#0F172A" />
              <h3>{item}</h3>
              <p>Active. Edit page text and treatment slugs through the Settings CMS editor.</p>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="homepage" focusOnly />
      </AdminSection>
    );
  }

  if (section === "analytics") {
    return (
      <AdminSection eyebrow="Analytics" title="Platform analytics overview">
        <div className="grid grid-4">
          {analytics.map((item) => (
            <article className="dashboard-card" key={item.label}>
              <span className="module-icon">
                <CmsIcon iconKey={item.iconKey} />
              </span>
              <strong>{item.value}</strong>
              <p>{item.label}</p>
            </article>
          ))}
        </div>
      </AdminSection>
    );
  }

  if (section === "users") {
    return (
      <AdminSection eyebrow="Users" title="Manage users">
        <div className="table-card">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <span className="status">{user.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>
    );
  }

  if (section === "roles" || section === "permissions") {
    const items =
      section === "roles"
        ? ["Super Admin", "Admin", "Doctor", "Editor", "Patient"]
        : ["Manage CMS", "Manage Appointments", "Manage Media", "Manage SEO", "View Analytics", "Manage Users"];

    return (
      <AdminSection eyebrow={section === "roles" ? "Roles" : "Permissions"} title={section === "roles" ? "Role groups" : "Permission matrix"}>
        <div className="grid grid-4">
          {items.map((item) => (
            <article className="card" key={item}>
              {section === "roles" ? <UserRound size={22} color="#0F172A" /> : <LockKeyhole size={22} color="#0F172A" />}
              <h3>{item}</h3>
              <p>{section === "roles" ? "Role is ready for authentication and permission wiring." : "Permission-ready area for role-based access."}</p>
            </article>
          ))}
        </div>
      </AdminSection>
    );
  }

  return (
    <>
      <AdminSection eyebrow="Settings" title="Website settings">
        <div className="grid grid-3">
          {cmsAreas.map((area) => (
            <article className="card" key={area}>
              <ShieldCheck size={22} color="#0F172A" />
              <h3>{area}</h3>
              <p>Editable through Live Website CMS below. Changes update the customer website.</p>
            </article>
          ))}
        </div>
      </AdminSection>
      <AdminCmsEditor />
      <section className="admin-section" aria-label="Notifications">
        <div className="section-heading">
          <span className="eyebrow">Notifications</span>
          <h2>Recent activity</h2>
        </div>
        <div className="grid grid-3">
          {appointments.slice(0, 3).map((appointment) => (
            <article className="card" key={appointment.id}>
              <Bell size={22} color="#0F172A" />
              <h3>{appointment.name}</h3>
              <p>{appointment.treatment} appointment received on {formatDate(appointment.createdAt)}.</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function IconGrid({
  items,
  nameKey
}: {
  items: Array<{ iconKey: Parameters<typeof CmsIcon>[0]["iconKey"]; summary: string } & Record<string, string>>;
  nameKey: string;
}) {
  return (
    <div className="grid grid-3">
      {items.map((item) => (
        <article className="card" key={item[nameKey]}>
          <span className="card-icon">
            <CmsIcon iconKey={item.iconKey} />
          </span>
          <h3>{item[nameKey]}</h3>
          <p>{item.summary}</p>
        </article>
      ))}
    </div>
  );
}
