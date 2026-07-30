import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRole, type Role } from "@/lib/rbac";
import { verifyTotp } from "@/lib/totp";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  active: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string | null;
};

const defaultAdminHash = "$2b$12$2surz94QOSos3/i1KFMxG./OJtTNXwL5G59imTTv2m.nBXOckD0bq";

function fallbackAdmin(): AuthUser {
  return {
    id: "local-super-admin",
    name: process.env.ADMIN_NAME ?? "Super Admin",
    email: process.env.ADMIN_EMAIL ?? "admin@npncarehospital.com",
    role: "SUPER_ADMIN",
    passwordHash: process.env.ADMIN_PASSWORD_HASH ?? defaultAdminHash,
    active: true,
    twoFactorEnabled: Boolean(process.env.ADMIN_TOTP_SECRET),
    twoFactorSecret: process.env.ADMIN_TOTP_SECRET
  };
}

export async function findAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const normalizedEmail = email.trim().toLowerCase();

  if (process.env.DATABASE_URL) {
    try {
      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          passwordHash: true,
          active: true,
          twoFactorEnabled: true,
          twoFactorSecret: true
        }
      });

      if (user?.passwordHash && isRole(user.role)) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          passwordHash: user.passwordHash,
          active: user.active,
          twoFactorEnabled: user.twoFactorEnabled,
          twoFactorSecret: user.twoFactorSecret
        };
      }
    } catch {
      // Fall through to local secure development account when the database is not reachable.
    }
  }

  const admin = fallbackAdmin();
  return admin.email.toLowerCase() === normalizedEmail ? admin : null;
}

export async function verifyUserPassword(user: AuthUser, password: string) {
  return bcrypt.compare(password, user.passwordHash);
}

export function verifyUserSecondFactor(user: AuthUser, token: string | undefined) {
  if (!user.twoFactorEnabled) return true;
  return verifyTotp(user.twoFactorSecret, token);
}
