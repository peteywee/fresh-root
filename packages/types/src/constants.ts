// [P1][INTEGRITY][CONSTANTS] Shared constants for the project
// Tags: P1, INTEGRITY, CONSTANTS

export const USER_ROLES = ["platform_super_admin", "network_owner", "org_admin", "staff"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLES_MAP = {
  PLATFORM_SUPER_ADMIN: USER_ROLES[0],
  NETWORK_OWNER: USER_ROLES[1],
  ORG_ADMIN: USER_ROLES[2],
  STAFF: USER_ROLES[3],
} as const;

export type UserRoleKey = keyof typeof USER_ROLES_MAP;
