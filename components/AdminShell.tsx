"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";

const adminNavItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Appointments", href: "/admin/appointments" },
  { label: "Agreements", href: "/admin/agreements" },
  { label: "Doctors", href: "/admin/doctors" },
  { label: "Departments", href: "/admin/departments" },
  { label: "Facilities", href: "/admin/facilities" },
  { label: "Treatments", href: "/admin/treatments" },
  { label: "Blogs", href: "/admin/blogs" },
  { label: "Gallery", href: "/admin/gallery" },
  { label: "Videos", href: "/admin/videos" },
  { label: "Testimonials", href: "/admin/testimonials" },
  { label: "Reviews", href: "/admin/reviews" },
  { label: "FAQs", href: "/admin/faqs" },
  { label: "SEO", href: "/admin/seo" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Users", href: "/admin/users" },
  { label: "Roles", href: "/admin/roles" },
  { label: "Permissions", href: "/admin/permissions" },
  { label: "Settings", href: "/admin/settings" }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <section className="dashboard-shell">
      <aside className="sidebar">
        <Link className="brand" href="/admin">
          <span className="brand-mark">N</span>
          <span>
            <strong>Admin</strong>
            <small>N.P.N. Care CMS</small>
          </span>
        </Link>
        <nav aria-label="Admin navigation">
          {adminNavItems.map((item) => (
            <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <AdminLogoutButton />
      </aside>

      <div className="dashboard-main">{children}</div>
    </section>
  );
}
