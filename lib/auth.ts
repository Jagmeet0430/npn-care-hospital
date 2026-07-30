import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { appendAuditLog } from "@/lib/audit";
import { checkRateLimit } from "@/lib/rate-limit";
import { findAuthUserByEmail, verifyUserPassword, verifyUserSecondFactor } from "@/lib/security-users";

function authSecret() {
  return process.env.NEXTAUTH_SECRET ?? "npn-local-nextauth-secret-change-before-production";
}

function requestIp(req: { headers?: Record<string, string | string[] | undefined> }) {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (Array.isArray(forwarded)) return forwarded[0]?.split(",")[0]?.trim();
  return forwarded?.split(",")[0]?.trim() ?? "local";
}

function requestUserAgent(req: { headers?: Record<string, string | string[] | undefined> }) {
  const userAgent = req.headers?.["user-agent"];
  return Array.isArray(userAgent) ? userAgent[0] : userAgent;
}

export const authOptions: NextAuthOptions = {
  secret: authSecret(),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8
  },
  pages: {
    signIn: "/admin/login"
  },
  providers: [
    CredentialsProvider({
      name: "Secure Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorCode: { label: "2FA Code", type: "text" }
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase() ?? "";
        const ip = requestIp(req);
        const userAgent = requestUserAgent(req);
        const rateLimit = checkRateLimit(`login:${ip}:${email}`, 6, 10 * 60 * 1000);

        if (!rateLimit.allowed) {
          await appendAuditLog({
            action: "LOGIN_FAILED",
            actorEmail: email,
            ip,
            userAgent,
            message: "Login blocked by rate limit."
          });
          return null;
        }

        const user = email ? await findAuthUserByEmail(email) : null;
        const validPassword = user && credentials?.password ? await verifyUserPassword(user, credentials.password) : false;
        const validSecondFactor = user ? verifyUserSecondFactor(user, credentials?.twoFactorCode) : false;

        if (!user || !user.active || !validPassword || !validSecondFactor) {
          await appendAuditLog({
            action: "LOGIN_FAILED",
            actorId: user?.id,
            actorEmail: email,
            role: user?.role,
            ip,
            userAgent,
            message: !validSecondFactor ? "Invalid two-factor code." : "Invalid credentials."
          });
          return null;
        }

        await appendAuditLog({
          action: "LOGIN_SUCCESS",
          actorId: user.id,
          actorEmail: user.email,
          role: user.role,
          ip,
          userAgent,
          message: "User signed in successfully."
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "PATIENT";
      }

      return session;
    }
  }
};
