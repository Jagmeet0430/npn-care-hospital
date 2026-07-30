export const roles = ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT", "CONTENT_MANAGER"] as const;
export type Role = (typeof roles)[number];

export const permissions = [
  "admin:access",
  "appointments:read",
  "appointments:update",
  "agreements:read",
  "agreements:update",
  "cms:update",
  "media:upload",
  "users:manage",
  "security:read"
] as const;

export type Permission = (typeof permissions)[number];

const rolePermissions: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...permissions],
  HOSPITAL_ADMIN: [
    "admin:access",
    "appointments:read",
    "appointments:update",
    "agreements:read",
    "agreements:update",
    "cms:update",
    "media:upload",
    "security:read"
  ],
  CONTENT_MANAGER: ["admin:access", "cms:update", "media:upload"],
  DOCTOR: ["admin:access", "appointments:read", "agreements:read", "agreements:update"],
  RECEPTIONIST: ["admin:access", "appointments:read", "appointments:update", "agreements:read"],
  PATIENT: []
};

export function hasPermission(role: Role | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}
