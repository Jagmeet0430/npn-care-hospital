"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase-browser";

type AdminLoginFormProps = {
  nextPath: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  two_factor_enabled: boolean;
};

function cleanNextPath(value: string) {
  if (
    !value.startsWith("/admin") ||
    value.startsWith("/admin/login")
  ) {
    return "/admin";
  }

  return value;
}

export function AdminLoginForm({
  nextPath,
}: AdminLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");

  const [status, setStatus] = useState(
    "Use your admin credentials to continue."
  );

  const [loading, setLoading] = useState(false);

  async function submitLogin(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setLoading(true);
    setStatus("Checking admin access...");

    try {
      const cleanEmail = email.trim().toLowerCase();

      // ==========================================
      // 1. LOGIN WITH SUPABASE AUTH
      // ==========================================
      const {
        data: authData,
        error: authError,
      } =
        await supabaseBrowser.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

      if (authError || !authData.user) {
        console.error(
          "SUPABASE LOGIN ERROR:",
          authError
        );

        setStatus(
          "Incorrect email or password."
        );

        return;
      }

      // ==========================================
      // 2. CHECK ADMIN RECORD
      // ==========================================
      const {
        data: admin,
        error: adminError,
      } =
        await supabaseBrowser
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
          .eq("id", authData.user.id)
          .maybeSingle<AdminUser>();

      if (adminError) {
        console.error(
          "ADMIN USER LOOKUP ERROR:",
          adminError
        );

        await supabaseBrowser.auth.signOut();

        setStatus(
          "Unable to verify admin access."
        );

        return;
      }

      // ==========================================
      // 3. ADMIN RECORD MUST EXIST
      // ==========================================
      if (!admin) {
        console.error(
          "Authenticated user is not an admin:",
          authData.user.id
        );

        await supabaseBrowser.auth.signOut();

        setStatus(
          "This account does not have admin access."
        );

        return;
      }

      // ==========================================
      // 4. CHECK ACTIVE STATUS
      // ==========================================
      if (!admin.is_active) {
        await supabaseBrowser.auth.signOut();

        setStatus(
          "This admin account has been disabled."
        );

        return;
      }

      // ==========================================
      // 5. CHECK ADMIN ROLE
      // ==========================================
      const allowedRoles = [
        "SUPER_ADMIN",
        "HOSPITAL_ADMIN",
        "CONTENT_MANAGER",
      ];

      if (!allowedRoles.includes(admin.role)) {
        console.error(
          "Unauthorized admin role:",
          admin.role
        );

        await supabaseBrowser.auth.signOut();

        setStatus(
          "You do not have permission to access the admin panel."
        );

        return;
      }

      // ==========================================
      // 6. CHECK 2FA SETTING
      // ==========================================
      if (admin.two_factor_enabled) {
        if (!twoFactorCode.trim()) {
          setStatus(
            "Please enter your 6-digit 2FA code."
          );

          return;
        }

        if (!/^\d{6}$/.test(twoFactorCode)) {
          setStatus(
            "2FA code must contain exactly 6 digits."
          );

          return;
        }

        /*
         * We will connect real Supabase MFA
         * verification after the basic login works.
         */
      }

      // ==========================================
      // 7. UPDATE LOGIN INFORMATION
      // ==========================================
      const { error: updateError } =
        await supabaseBrowser
          .from("admin_users")
          .update({
            last_login_at:
              new Date().toISOString(),
            failed_login_count: 0,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", admin.id);

      if (updateError) {
        console.warn(
          "Unable to update login metadata:",
          updateError
        );
      }

      // ==========================================
      // 8. LOGIN SUCCESS
      // ==========================================
      setStatus(
        `Welcome ${admin.name}. Redirecting...`
      );

      router.replace(
        cleanNextPath(nextPath)
      );

      router.refresh();
    } catch (error) {
      console.error(
        "ADMIN LOGIN ERROR:",
        error
      );

      setStatus(
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-login-section">
      <div className="admin-login-card">

        <div className="admin-login-header">

          <div className="admin-login-brand">
            <span className="admin-login-logo">
              N
            </span>

            <span className="admin-login-secure">
              <ShieldCheck size={17} />
              Secure Admin
            </span>
          </div>

          <h1>
            N.P.N. Care
            <br />
            Hospital CMS
          </h1>

          <p>
            Sign in to manage appointments,
            agreements, website content, images,
            and hospital operations.
          </p>
        </div>

        <form
          className="admin-login-form"
          onSubmit={submitLogin}
        >

          <label>
            Admin Email

            <span className="input-icon">
              <Mail size={18} />

              <input
                autoComplete="email"
                autoFocus
                disabled={loading}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="npncarehospital786@gmail.com"
                required
                type="email"
                value={email}
              />
            </span>
          </label>

          <label>
            Password

            <span className="input-icon">
              <LockKeyhole size={18} />

              <input
                autoComplete="current-password"
                disabled={loading}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter admin password"
                required
                type="password"
                value={password}
              />
            </span>
          </label>

          <label>
            2FA Code

            <span className="input-icon">
              <KeyRound size={18} />

              <input
                autoComplete="one-time-code"
                disabled={loading}
                inputMode="numeric"
                maxLength={6}
                onChange={(event) =>
                  setTwoFactorCode(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="Optional 6-digit code"
                type="text"
                value={twoFactorCode}
              />
            </span>
          </label>

          <button
            className="button button-primary"
            disabled={loading}
            type="submit"
          >
            <LockKeyhole size={18} />

            {loading
              ? "Signing in..."
              : "Login to Admin"}
          </button>

          <p className="success-note">
            {status}
          </p>

        </form>
      </div>
    </section>
  );
}                                                    