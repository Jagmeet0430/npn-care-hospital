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
import { AdminAppointmentManager } from "@/components/AdminAppointmentManager";
import { AdminCmsEditor } from "@/components/AdminCmsEditor";
import { AdminGalleryUploader } from "@/components/AdminGalleryUploader";
import { CmsIcon } from "@/components/CmsIcon";
import { getAppointments } from "@/lib/appointments";
import { getAgreements } from "@/lib/agreements";
import { getCmsContent } from "@/lib/cms";

export const adminSectionSlugs = [
  "appointments",
  "agreements",
  "doctors",
  "departments",
  "facilities",
  "treatments",
  "blogs",
  "gallery",
  "videos",
  "testimonials",
  "reviews",
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

export async function AdminDashboardContent() {
  const content = await getCmsContent();
  const appointments = await getAppointments();
  const agreements = await getAgreements();

  const modules = [
    ...content.adminModules,
    { title: "Agreements", value: String(agreements.length), iconKey: "fileHeart" as const }
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
        <input placeholder="Search appointments, doctors, treatments, media, reviews, or SEO pages" />
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
          <Bell size={22} color="#227a59" />
          <h3>Latest appointment</h3>
          <p>{appointments[0] ? `${appointments[0].name} requested ${appointments[0].treatment}.` : "No appointments yet."}</p>
        </article>
        <article className="card">
          <FileText size={22} color="#227a59" />
          <h3>Agreement queue</h3>
          <p>{agreements.length ? `${agreements.length} agreement records available for review.` : "No agreements submitted yet."}</p>
        </article>
        <article className="card">
          <BarChart3 size={22} color="#227a59" />
          <h3>Live customer sync</h3>
          <p>Use Settings for CMS edits. Public pages update from the same content source after refresh.</p>
        </article>
      </div>

      <AdminCmsEditor initialSection="adminModules" focusOnly />
    </section>
  );
}

export async function AdminSectionContent({ section }: { section: string }) {
  const content = await getCmsContent();
  const appointments = await getAppointments();
  const agreements = await getAgreements();
  const {
    blogPosts,
    cmsAreas,
    departments,
    doctors,
    facilities,
    faqs,
    gallery,
    galleryImages,
    testimonials,
    treatments,
    videoTitles
  } = content;

  const analytics = [
    { label: "Website Pages", value: "36", iconKey: "building" as const },
    { label: "Appointments", value: String(appointments.length), iconKey: "calendar" as const },
    { label: "Agreements", value: String(agreements.length), iconKey: "fileHeart" as const },
    { label: "Treatments", value: String(treatments.length), iconKey: "leaf" as const },
    { label: "Doctors", value: String(doctors.length), iconKey: "stethoscope" as const }
  ];

  const users = [
    { name: "Super Admin", email: "admin@npncarehospital.com", role: "SUPER_ADMIN", status: "Active" },
    { name: "Care Desk", email: "care@npncarehospital.com", role: "ADMIN", status: "Active" },
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
      <AdminSection
        eyebrow="Agreement Management"
        title="Review digital patient agreements"
        text="Approve, reject, request changes, assign doctors, download, print, and track every agreement from one secure workflow."
      >
        <AdminAgreementManager agreements={agreements} departments={departments} doctors={doctors} />
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
      <AdminSection eyebrow="Blogs" title="Manage health blog content">
        <div className="grid grid-3">
          {blogPosts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <span className="eyebrow">{post.category}</span>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <strong>{post.readTime}</strong>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="blogPosts" focusOnly />
      </AdminSection>
    );
  }

  if (section === "gallery") {
    return (
      <AdminSection eyebrow="Gallery" title="Manage gallery categories">
        <AdminGalleryUploader images={galleryImages} />
        <div className="grid grid-3">
          {gallery.map((item) => (
            <div className="media-tile" key={item}>
              {item}
            </div>
          ))}
        </div>
        <AdminCmsEditor initialSection="gallery" focusOnly />
      </AdminSection>
    );
  }

  if (section === "videos") {
    return (
      <AdminSection eyebrow="Videos" title="Manage video library">
        <div className="grid grid-3">
          {videoTitles.map((item) => (
            <article className="card" key={item}>
              <CmsIcon iconKey="video" />
              <h3>{item}</h3>
              <p>Video title is CMS editable. Connect upload storage later for file-based video management.</p>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="videoTitles" focusOnly />
      </AdminSection>
    );
  }

  if (section === "testimonials" || section === "reviews") {
    return (
      <AdminSection eyebrow={section === "reviews" ? "Reviews" : "Testimonials"} title={section === "reviews" ? "Manage ratings and reviews" : "Manage patient stories"}>
        <div className="grid grid-3">
          {testimonials.map((story) => (
            <article className="card" key={story.name}>
              {section === "reviews" ? <span className="status">5 star</span> : null}
              <h3>{story.name}</h3>
              <p>{story.condition}</p>
              <p>&quot;{story.quote}&quot;</p>
            </article>
          ))}
        </div>
        <AdminCmsEditor initialSection="testimonials" focusOnly />
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
              <FileText size={22} color="#227a59" />
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
              {section === "roles" ? <UserRound size={22} color="#227a59" /> : <LockKeyhole size={22} color="#227a59" />}
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
              <ShieldCheck size={22} color="#0f8a55" />
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
              <Bell size={22} color="#227a59" />
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
