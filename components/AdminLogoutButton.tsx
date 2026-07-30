"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  async function logout() {
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <button className="admin-logout-button" onClick={() => void logout()} type="button">
      <LogOut size={17} />
      Logout
    </button>
  );
}
