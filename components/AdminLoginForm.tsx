"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { KeyRound, LockKeyhole, Mail, ShieldCheck } from "lucide-react";

type AdminLoginFormProps = {
  nextPath: string;
};

function cleanNextPath(value: string) {
  if (!value.startsWith("/admin") || value.startsWith("/admin/login")) return "/admin";
  return value;
}

export function AdminLoginForm({ nextPath }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [status, setStatus] = useState("Use your admin credentials to continue.");
  const [loading, setLoading] = useState(false);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus("Checking admin access...");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      twoFactorCode
    });

    setLoading(false);

    if (result?.error) {
      setStatus("Incorrect credentials or two-factor code.");
      return;
    }

    router.replace(cleanNextPath(nextPath));
    router.refresh();
  }

  return (
    <section className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <span className="brand-mark">N</span>
          <div>
            <span className="eyebrow">
              <ShieldCheck size={17} />
              Secure Admin
            </span>
            <h1>N.P.N. Care Hospital CMS</h1>
            <p>Sign in to manage appointments, agreements, website content, images, and hospital operations.</p>
          </div>
        </div>

        <form className="admin-login-form" onSubmit={submitLogin}>
          <label>
            Admin Email
            <span className="input-icon">
              <Mail size={18} />
              <input
                autoComplete="email"
                autoFocus
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@npncarehospital.com"
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
                onChange={(event) => setPassword(event.target.value)}
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
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setTwoFactorCode(event.target.value)}
                placeholder="Optional 6-digit code"
                type="text"
                value={twoFactorCode}
              />
            </span>
          </label>
          <button className="button button-primary" disabled={loading} type="submit">
            <LockKeyhole size={18} />
            {loading ? "Signing in..." : "Login to Admin"}
          </button>
          <p className="success-note">{status}</p>
        </form>
      </div>
    </section>
  );
}
