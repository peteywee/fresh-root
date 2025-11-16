// [P1][INTEGRITY][POLICY] Abstract, database-agnostic data-access policy
// Tags: P1, INTEGRITY, POLICY

import { USER_ROLES_MAP } from "./constants";

/**
 * @fileoverview The single source of truth for data access policy.
 * @standard DATA_ACCESS_POLICY_STANDARD
 */

export const DataAccessPolicy = {
  collections: {
    organizations: {
      // Default scope is tenant-level access.
      read: [USER_ROLES_MAP.NETWORK_OWNER, USER_ROLES_MAP.ORG_ADMIN, USER_ROLES_MAP.STAFF],
      create: [USER_ROLES[1]],
      update: [USER_ROLES_MAP.NETWORK_OWNER, USER_ROLES_MAP.ORG_ADMIN],
      delete: [], // No one can delete organizations from the client.
      fields: {
        id: { immutable: true },
        networkId: { immutable: true },
        plan: {
          // Field-level overrides provide granular control.
          update: [USER_ROLES_MAP.NETWORK_OWNER],
        },
      },
    },
    // ... other collection policies
  },
};
