import type { Metadata } from "next";
import { AdminSectionContent } from "@/components/AdminSectionContent";
import { AdminShell } from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "Agreement Management",
  description: "Dedicated agreement management module for N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function AdminAgreementsPage() {
  return (
    <AdminShell>
      <AdminSectionContent section="agreements" />
    </AdminShell>
  );
}
