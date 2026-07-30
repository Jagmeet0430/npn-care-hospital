import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminSectionContent, adminSectionSlugs } from "@/components/AdminSectionContent";
import { AdminShell } from "@/components/AdminShell";

type AdminSectionPageProps = {
  params: Promise<{ section: string }>;
};

export const metadata: Metadata = {
  title: "Admin Workspace",
  description: "Dedicated admin workspace for N.P.N. Care Hospital."
};

export const dynamic = "force-dynamic";

export default async function AdminSectionPage({ params }: AdminSectionPageProps) {
  const { section } = await params;

  if (!adminSectionSlugs.includes(section)) {
    notFound();
  }

  return (
    <AdminShell>
      <AdminSectionContent section={section} />
    </AdminShell>
  );
}
