export const roles = ["SUPER_ADMIN", "HOSPITAL_ADMIN", "DOCTOR", "RECEPTIONIST", "PATIENT", "CONTENT_MANAGER"] as const;
export type Role = (typeof roles)[number];

export const permissions = [
  "admin:access",
  "appointments:read",
  "appointments:update",
  "appointments:delete",
  "agreements:read",
  "agreements:update",
  "agreements:delete",
  "careers:read",
  "careers:update",
  "careers:delete",
  "ai:read",
  "ai:update",
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
    "appointments:delete",
    "agreements:read",
    "agreements:update",
    "agreements:delete",
    "careers:read",
    "careers:update",
    "careers:delete",
    "ai:read",
    "ai:update",
    "cms:update",
    "media:upload",
    "security:read"
  ],
  CONTENT_MANAGER: ["admin:access", "cms:update", "media:upload", "ai:read", "ai:update"],
  DOCTOR: ["admin:access", "appointments:read", "agreements:read", "agreements:update", "careers:read", "ai:read"],
  RECEPTIONIST: ["admin:access", "appointments:read", "appointments:update", "appointments:delete", "agreements:read", "careers:read", "careers:update", "ai:read"],
  PATIENT: []
};

export function hasPermission(role: Role | undefined, permission: Permission) {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}
