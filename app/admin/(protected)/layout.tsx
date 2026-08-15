import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();

  // Check Supabase authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in
  if (!user) {
    redirect("/admin/login");
  }

  // Check admin_users table
  const { data: admin, error } = await supabase
    .from("admin_users")
    .select(
      `
        id,
        name,
        email,
        role,
        is_active,
        two_factor_enabled
      `
    )
    .eq("id", user.id)
    .maybeSingle();

  // User doesn't exist in admin_users
  if (error || !admin) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  // Admin account disabled
  if (!admin.is_active) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  // Only these roles can access CMS
  const allowedRoles = [
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "CONTENT_MANAGER",
  ];

  if (!allowedRoles.includes(admin.role)) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  return <>{children}</>;
}