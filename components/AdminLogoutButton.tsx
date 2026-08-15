"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export function AdminLogoutButton() {
  async function logout() {
    await supabase.auth.signOut();

    window.location.href = "/admin/login";
  }

  return (
    <button
      className="admin-logout-button"
      onClick={() => void logout()}
      type="button"
    >
      <LogOut size={17} />
      Logout
    </button>
  );
}