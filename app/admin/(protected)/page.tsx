import type { Metadata } from "next";
import { AdminDashboardContent } from "@/components/AdminSectionContent";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "CMS and operations dashboard for N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <AdminShell>
      <AdminDashboardContent />
    </AdminShell>
  );
}
