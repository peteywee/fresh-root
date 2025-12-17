// [P1][TEST][SECURITY] Comprehensive Firestore Security Rules Tests
// Tags: P1, TEST, SECURITY, RULES, MULTI_TENANT, RBAC

import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, it, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import type { Firestore } from "firebase/firestore";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
} from "firebase/firestore";

// =============================================================================
// TEST CONFIGURATION
// =============================================================================

const PROJECT_ID = "rules-test-project";
const RULES_PATH = resolve(__dirname, "../../../firestore.rules");

let testEnv: RulesTestEnvironment;

// Test user configurations
const ORG_1_ID = "org-test-1";
const ORG_2_ID = "org-test-2";

const USERS = {
  // Org 1 users
  org1_owner: {
    uid: "user-org1-owner",
    token: { orgId: ORG_1_ID, roles: ["org_owner"] },
  },
  org1_admin: {
    uid: "user-org1-admin",
    token: { orgId: ORG_1_ID, roles: ["admin"] },
  },
  org1_manager: {
    uid: "user-org1-manager",
    token: { orgId: ORG_1_ID, roles: ["manager"] },
  },
  org1_scheduler: {
    uid: "user-org1-scheduler",
    token: { orgId: ORG_1_ID, roles: ["scheduler"] },
  },
  org1_staff: {
    uid: "user-org1-staff",
    token: { orgId: ORG_1_ID, roles: ["staff"] },
  },
  // Org 2 users (for cross-org isolation tests)
  org2_owner: {
    uid: "user-org2-owner",
    token: { orgId: ORG_2_ID, roles: ["org_owner"] },
  },
  org2_admin: {
    uid: "user-org2-admin",
    token: { orgId: ORG_2_ID, roles: ["admin"] },
  },
  org2_manager: {
    uid: "user-org2-manager",
    token: { orgId: ORG_2_ID, roles: ["manager"] },
  },
  // User without org membership
  unassigned: {
    uid: "user-unassigned",
    token: {},
  },
};

// =============================================================================
// SETUP / TEARDOWN
// =============================================================================

beforeAll(async () => {
  const rules = readFileSync(RULES_PATH, "utf-8");
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules,
      host: "localhost",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function getAuthenticatedContext(user: { uid: string; token: object }): Firestore {
  return testEnv.authenticatedContext(user.uid, user.token).firestore();
}

function getUnauthenticatedContext(): Firestore {
  return testEnv.unauthenticatedContext().firestore();
}

async function seedMembership(
  uid: string,
  orgId: string,
  roles: string[],
  status = "active"
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const membershipId = `${uid}_${orgId}`;
    await setDoc(doc(db, "memberships", membershipId), {
      uid,
      orgId,
      roles,
      status,
      createdAt: new Date(),
    });
  });
}

async function seedOrg(orgId: string, name = "Test Org"): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "orgs", orgId), {
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await setDoc(doc(db, "organizations", orgId), {
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

async function seedSchedule(
  orgId: string,
  scheduleId: string,
  data: object = {}
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "orgs", orgId, "schedules", scheduleId), {
      name: "Test Schedule",
      status: "draft",
      orgId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await setDoc(doc(db, "schedules", orgId, "schedules", scheduleId), {
      name: "Test Schedule",
      status: "draft",
      orgId,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });
}

async function seedShift(
  orgId: string,
  scheduleId: string,
  shiftId: string,
  userId: string | null = null,
  data: object = {}
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const shiftData = {
      orgId,
      scheduleId,
      userId,
      notes: "",
      checkInTime: null,
      status: "draft",
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await setDoc(
      doc(db, "orgs", orgId, "schedules", scheduleId, "shifts", shiftId),
      shiftData
    );
    await setDoc(doc(db, "shifts", orgId, "shifts", shiftId), shiftData);
  });
}

async function seedVenue(
  orgId: string,
  venueId: string,
  data: object = {}
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "venues", orgId, "venues", venueId), {
      name: "Test Venue",
      orgId,
      ...data,
      createdAt: new Date(),
    });
  });
}

async function seedJoinToken(
  orgId: string,
  tokenId: string,
  data: object = {}
): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "join_tokens", orgId, "join_tokens", tokenId), {
      orgId,
      role: "staff",
      status: "active",
      maxUses: 1,
      currentUses: 0,
      ...data,
      createdAt: new Date(),
    });
  });
}

async function seedUser(uid: string, data: object = {}): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users", uid), {
      email: `${uid}@test.com`,
      displayName: "Test User",
      ...data,
      createdAt: new Date(),
    });
  });
}

async function seedNetwork(networkId: string, data: object = {}): Promise<void> {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "networks", networkId), {
      name: "Test Network",
      status: "active",
      ...data,
      createdAt: new Date(),
    });
  });
}

// =============================================================================
// TEST SUITES
// =============================================================================

describe("Firestore Security Rules", () => {
  // ===========================================================================
  // 1. MULTI-TENANT ISOLATION TESTS
  // ===========================================================================
  describe("Multi-Tenant Isolation", () => {
    describe("Cross-org reads are blocked", () => {
      it("MTISO-001: Org 2 owner cannot read Org 1 org document", async () => {
        await seedOrg(ORG_1_ID, "Org 1");
        const db = getAuthenticatedContext(USERS.org2_owner);
        await assertFails(getDoc(doc(db, "orgs", ORG_1_ID)));
      });

      it("MTISO-002: Org 2 admin cannot read Org 1 schedules", async () => {
        await seedOrg(ORG_1_ID);
        await seedSchedule(ORG_1_ID, "schedule-1");
        const db = getAuthenticatedContext(USERS.org2_admin);
        await assertFails(
          getDoc(doc(db, "orgs", ORG_1_ID, "schedules", "schedule-1"))
        );
      });

      it("MTISO-003: Org 2 manager cannot read Org 1 shifts", async () => {
        await seedOrg(ORG_1_ID);
        await seedSchedule(ORG_1_ID, "schedule-1");
        await seedShift(ORG_1_ID, "schedule-1", "shift-1");
        const db = getAuthenticatedContext(USERS.org2_manager);
        await assertFails(
          getDoc(doc(db, "shifts", ORG_1_ID, "shifts", "shift-1"))
        );
      });

      it("MTISO-004: Org 2 user cannot read Org 1 venues", async () => {
        await seedOrg(ORG_1_ID);
        await seedVenue(ORG_1_ID, "venue-1");
        const db = getAuthenticatedContext(USERS.org2_owner);
        await assertFails(getDoc(doc(db, "venues", ORG_1_ID, "venues", "venue-1")));
      });

      it("MTISO-005: Org 2 user cannot read Org 1 join tokens", async () => {
        await seedOrg(ORG_1_ID);
        await seedJoinToken(ORG_1_ID, "token-1");
        const db = getAuthenticatedContext(USERS.org2_manager);
        await assertFails(
          getDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "token-1"))
        );
      });
    });

    describe("Cross-org writes are blocked", () => {
      it("MTISO-006: Org 2 owner cannot write to Org 1 org document", async () => {
        await seedOrg(ORG_1_ID, "Org 1");
        const db = getAuthenticatedContext(USERS.org2_owner);
        await assertFails(
          updateDoc(doc(db, "orgs", ORG_1_ID), { name: "Hacked" })
        );
      });

      it("MTISO-007: Org 2 manager cannot create schedules in Org 1", async () => {
        await seedOrg(ORG_1_ID);
        const db = getAuthenticatedContext(USERS.org2_manager);
        await assertFails(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "hacked-schedule"), {
            name: "Hacked Schedule",
            status: "draft",
          })
        );
      });

      it("MTISO-008: Org 2 manager cannot create shifts in Org 1", async () => {
        await seedOrg(ORG_1_ID);
        await seedSchedule(ORG_1_ID, "schedule-1");
        const db = getAuthenticatedContext(USERS.org2_manager);
        await assertFails(
          setDoc(doc(db, "shifts", ORG_1_ID, "shifts", "hacked-shift"), {
            scheduleId: "schedule-1",
            status: "draft",
          })
        );
      });

      it("MTISO-009: Org 2 admin cannot delete Org 1 venues", async () => {
        await seedOrg(ORG_1_ID);
        await seedVenue(ORG_1_ID, "venue-1");
        const db = getAuthenticatedContext(USERS.org2_admin);
        await assertFails(
          deleteDoc(doc(db, "venues", ORG_1_ID, "venues", "venue-1"))
        );
      });

      it("MTISO-010: Org 2 owner cannot create join tokens for Org 1", async () => {
        await seedOrg(ORG_1_ID);
        const db = getAuthenticatedContext(USERS.org2_owner);
        await assertFails(
          setDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "hacked-token"), {
            role: "admin",
            status: "active",
          })
        );
      });
    });

    describe("Users without org membership are blocked", () => {
      it("MTISO-011: Unassigned user cannot read org documents", async () => {
        await seedOrg(ORG_1_ID);
        const db = getAuthenticatedContext(USERS.unassigned);
        await assertFails(getDoc(doc(db, "orgs", ORG_1_ID)));
      });

      it("MTISO-012: Unassigned user cannot read schedules", async () => {
        await seedOrg(ORG_1_ID);
        await seedSchedule(ORG_1_ID, "schedule-1");
        const db = getAuthenticatedContext(USERS.unassigned);
        await assertFails(
          getDoc(doc(db, "orgs", ORG_1_ID, "schedules", "schedule-1"))
        );
      });

      it("MTISO-013: Unassigned user cannot write to any org", async () => {
        await seedOrg(ORG_1_ID);
        const db = getAuthenticatedContext(USERS.unassigned);
        await assertFails(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
            name: "Unauthorized",
          })
        );
      });

      it("MTISO-014: Unauthenticated user cannot read org data", async () => {
        await seedOrg(ORG_1_ID);
        const db = getUnauthenticatedContext();
        await assertFails(getDoc(doc(db, "orgs", ORG_1_ID)));
      });

      it("MTISO-015: Unauthenticated user cannot write org data", async () => {
        const db = getUnauthenticatedContext();
        await assertFails(
          setDoc(doc(db, "orgs", "new-org"), { name: "Unauthorized Org" })
        );
      });
    });
  });

  // ===========================================================================
  // 2. ROLE-BASED ACCESS CONTROL (RBAC) TESTS
  // ===========================================================================
  describe("Role-Based Access Control", () => {
    describe("Write access granted only to admin|manager", () => {
      beforeEach(async () => {
        await seedOrg(ORG_1_ID);
      });

      it("RBAC-001: Org owner can write schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_owner);
        await assertSucceeds(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
            name: "Owner Schedule",
            status: "draft",
          })
        );
      });

      it("RBAC-002: Admin can write schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_admin);
        await assertSucceeds(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
            name: "Admin Schedule",
            status: "draft",
          })
        );
      });

      it("RBAC-003: Manager can write schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_manager);
        await assertSucceeds(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
            name: "Manager Schedule",
            status: "draft",
          })
        );
      });

      it("RBAC-004: Scheduler can write schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_scheduler);
        await assertSucceeds(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
            name: "Scheduler Schedule",
            status: "draft",
          })
        );
      });

      it("RBAC-005: Staff CANNOT write schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_staff);
        await assertFails(
          setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
            name: "Staff Schedule",
            status: "draft",
          })
        );
      });

      it("RBAC-006: Staff CAN read schedules", async () => {
        await seedSchedule(ORG_1_ID, "schedule-1");
        const db = getAuthenticatedContext(USERS.org1_staff);
        await assertSucceeds(
          getDoc(doc(db, "orgs", ORG_1_ID, "schedules", "schedule-1"))
        );
      });
    });

    describe("Position writes require manager+", () => {
      beforeEach(async () => {
        await seedOrg(ORG_1_ID);
      });

      it("RBAC-007: Manager can write positions", async () => {
        const db = getAuthenticatedContext(USERS.org1_manager);
        await assertSucceeds(
          setDoc(doc(db, "orgs", ORG_1_ID, "positions", "new-position"), {
            name: "Manager Position",
          })
        );
      });

      it("RBAC-008: Scheduler CANNOT write positions", async () => {
        const db = getAuthenticatedContext(USERS.org1_scheduler);
        await assertFails(
          setDoc(doc(db, "orgs", ORG_1_ID, "positions", "new-position"), {
            name: "Scheduler Position",
          })
        );
      });

      it("RBAC-009: Staff CANNOT write positions", async () => {
        const db = getAuthenticatedContext(USERS.org1_staff);
        await assertFails(
          setDoc(doc(db, "orgs", ORG_1_ID, "positions", "new-position"), {
            name: "Staff Position",
          })
        );
      });
    });

    describe("Org update/delete requires owner", () => {
      beforeEach(async () => {
        await seedOrg(ORG_1_ID);
      });

      it("RBAC-010: Org owner can update org", async () => {
        const db = getAuthenticatedContext(USERS.org1_owner);
        await assertSucceeds(
          updateDoc(doc(db, "orgs", ORG_1_ID), { name: "Updated Name" })
        );
      });

      it("RBAC-011: Admin CANNOT update org (via token)", async () => {
        const db = getAuthenticatedContext(USERS.org1_admin);
        await assertFails(
          updateDoc(doc(db, "orgs", ORG_1_ID), { name: "Admin Update" })
        );
      });

      it("RBAC-012: Manager CANNOT update org", async () => {
        const db = getAuthenticatedContext(USERS.org1_manager);
        await assertFails(
          updateDoc(doc(db, "orgs", ORG_1_ID), { name: "Manager Update" })
        );
      });

      it("RBAC-013: Org owner can delete org", async () => {
        const db = getAuthenticatedContext(USERS.org1_owner);
        await assertSucceeds(deleteDoc(doc(db, "orgs", ORG_1_ID)));
      });

      it("RBAC-014: Admin CANNOT delete org (via token)", async () => {
        const db = getAuthenticatedContext(USERS.org1_admin);
        await assertFails(deleteDoc(doc(db, "orgs", ORG_1_ID)));
      });
    });

    describe("Join tokens require owner/admin", () => {
      beforeEach(async () => {
        await seedOrg(ORG_1_ID);
      });

      it("RBAC-015: Owner can create join tokens", async () => {
        const db = getAuthenticatedContext(USERS.org1_owner);
        await assertSucceeds(
          setDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "new-token"), {
            role: "staff",
            status: "active",
          })
        );
      });

      it("RBAC-016: Admin can create join tokens", async () => {
        const db = getAuthenticatedContext(USERS.org1_admin);
        await assertSucceeds(
          setDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "new-token"), {
            role: "staff",
            status: "active",
          })
        );
      });

      it("RBAC-017: Manager can read join tokens", async () => {
        await seedJoinToken(ORG_1_ID, "token-1");
        const db = getAuthenticatedContext(USERS.org1_manager);
        await assertSucceeds(
          getDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "token-1"))
        );
      });

      it("RBAC-018: Manager CANNOT create join tokens", async () => {
        const db = getAuthenticatedContext(USERS.org1_manager);
        await assertFails(
          setDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "new-token"), {
            role: "staff",
            status: "active",
          })
        );
      });

      it("RBAC-019: Scheduler CANNOT read join tokens", async () => {
        await seedJoinToken(ORG_1_ID, "token-1");
        const db = getAuthenticatedContext(USERS.org1_scheduler);
        await assertFails(
          getDoc(doc(db, "join_tokens", ORG_1_ID, "join_tokens", "token-1"))
        );
      });
    });

    describe("Schedule deletion requires manager+ (not scheduler)", () => {
      beforeEach(async () => {
        await seedOrg(ORG_1_ID);
        await seedSchedule(ORG_1_ID, "schedule-to-delete");
      });

      it("RBAC-020: Manager can delete schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_manager);
        await assertSucceeds(
          deleteDoc(doc(db, "schedules", ORG_1_ID, "schedules", "schedule-to-delete"))
        );
      });

      it("RBAC-021: Scheduler CANNOT delete schedules", async () => {
        const db = getAuthenticatedContext(USERS.org1_scheduler);
        await assertFails(
          deleteDoc(doc(db, "schedules", ORG_1_ID, "schedules", "schedule-to-delete"))
        );
      });
    });
  });

  // ===========================================================================
  // 3. STAFF SELF-SERVICE TESTS
  // ===========================================================================
  describe("Staff Self-Service", () => {
    it("STAFF-001: Staff can update their own shift notes", async () => {
      await seedOrg(ORG_1_ID);
      await seedSchedule(ORG_1_ID, "schedule-1");
      await seedShift(ORG_1_ID, "schedule-1", "shift-1", USERS.org1_staff.uid);

      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(
        updateDoc(doc(db, "shifts", ORG_1_ID, "shifts", "shift-1"), {
          notes: "Updated notes",
          updatedAt: new Date(),
        })
      );
    });

    it("STAFF-002: Staff can update their own shift checkInTime", async () => {
      await seedOrg(ORG_1_ID);
      await seedSchedule(ORG_1_ID, "schedule-1");
      await seedShift(ORG_1_ID, "schedule-1", "shift-1", USERS.org1_staff.uid);

      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(
        updateDoc(doc(db, "shifts", ORG_1_ID, "shifts", "shift-1"), {
          checkInTime: new Date(),
          updatedAt: new Date(),
        })
      );
    });

    it("STAFF-003: Staff CANNOT update shift status", async () => {
      await seedOrg(ORG_1_ID);
      await seedSchedule(ORG_1_ID, "schedule-1");
      await seedShift(ORG_1_ID, "schedule-1", "shift-1", USERS.org1_staff.uid);

      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(
        updateDoc(doc(db, "shifts", ORG_1_ID, "shifts", "shift-1"), {
          status: "published",
        })
      );
    });

    it("STAFF-004: Staff CANNOT update another user's shift", async () => {
      await seedOrg(ORG_1_ID);
      await seedSchedule(ORG_1_ID, "schedule-1");
      await seedShift(ORG_1_ID, "schedule-1", "shift-1", "other-user-id");

      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(
        updateDoc(doc(db, "shifts", ORG_1_ID, "shifts", "shift-1"), {
          notes: "Trying to update someone else's shift",
          updatedAt: new Date(),
        })
      );
    });
  });

  // ===========================================================================
  // 4. USER DOCUMENT TESTS
  // ===========================================================================
  describe("User Documents", () => {
    it("USER-001: User can read their own profile", async () => {
      await seedUser(USERS.org1_staff.uid);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(getDoc(doc(db, "users", USERS.org1_staff.uid)));
    });

    it("USER-002: User can update their own profile", async () => {
      await seedUser(USERS.org1_staff.uid);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(
        updateDoc(doc(db, "users", USERS.org1_staff.uid), {
          displayName: "Updated Name",
        })
      );
    });

    it("USER-003: User can create their own profile", async () => {
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(
        setDoc(doc(db, "users", USERS.org1_staff.uid), {
          email: "test@example.com",
          displayName: "New User",
        })
      );
    });

    it("USER-004: User CANNOT read another user's profile", async () => {
      await seedUser(USERS.org1_manager.uid);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(getDoc(doc(db, "users", USERS.org1_manager.uid)));
    });

    it("USER-005: User CANNOT update another user's profile", async () => {
      await seedUser(USERS.org1_manager.uid);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(
        updateDoc(doc(db, "users", USERS.org1_manager.uid), {
          displayName: "Hacked Name",
        })
      );
    });

    it("USER-006: User CANNOT list all users", async () => {
      await seedUser(USERS.org1_staff.uid);
      await seedUser(USERS.org1_manager.uid);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(getDocs(collection(db, "users")));
    });
  });

  // ===========================================================================
  // 5. MEMBERSHIP DOCUMENT TESTS
  // ===========================================================================
  describe("Membership Documents", () => {
    it("MEMB-001: User can read their own membership", async () => {
      await seedMembership(USERS.org1_staff.uid, ORG_1_ID, ["staff"]);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(
        getDoc(doc(db, "memberships", `${USERS.org1_staff.uid}_${ORG_1_ID}`))
      );
    });

    it("MEMB-002: User can create their own membership", async () => {
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(
        setDoc(doc(db, "memberships", `${USERS.org1_staff.uid}_${ORG_1_ID}`), {
          uid: USERS.org1_staff.uid,
          orgId: ORG_1_ID,
          roles: ["staff"],
          status: "pending",
        })
      );
    });

    it("MEMB-003: Manager can read team memberships", async () => {
      await seedMembership(USERS.org1_staff.uid, ORG_1_ID, ["staff"]);
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertSucceeds(
        getDoc(doc(db, "memberships", `${USERS.org1_staff.uid}_${ORG_1_ID}`))
      );
    });

    it("MEMB-004: Manager can update team memberships", async () => {
      await seedMembership(USERS.org1_staff.uid, ORG_1_ID, ["staff"]);
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertSucceeds(
        updateDoc(doc(db, "memberships", `${USERS.org1_staff.uid}_${ORG_1_ID}`), {
          roles: ["staff", "scheduler"],
        })
      );
    });

    it("MEMB-005: Staff CANNOT update their own membership roles", async () => {
      await seedMembership(USERS.org1_staff.uid, ORG_1_ID, ["staff"]);
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(
        updateDoc(doc(db, "memberships", `${USERS.org1_staff.uid}_${ORG_1_ID}`), {
          roles: ["admin"],
        })
      );
    });

    it("MEMB-006: Org 2 manager CANNOT read Org 1 memberships", async () => {
      await seedMembership(USERS.org1_staff.uid, ORG_1_ID, ["staff"]);
      const db = getAuthenticatedContext(USERS.org2_manager);
      await assertFails(
        getDoc(doc(db, "memberships", `${USERS.org1_staff.uid}_${ORG_1_ID}`))
      );
    });

    it("MEMB-007: Cannot list all memberships", async () => {
      await seedMembership(USERS.org1_staff.uid, ORG_1_ID, ["staff"]);
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertFails(getDocs(collection(db, "memberships")));
    });
  });

  // ===========================================================================
  // 6. NETWORK DOCUMENT TESTS
  // ===========================================================================
  describe("Network Documents (v14+)", () => {
    it("NET-001: Authenticated user can read network metadata", async () => {
      await seedNetwork("network-1");
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertSucceeds(getDoc(doc(db, "networks", "network-1")));
    });

    it("NET-002: Unauthenticated user CANNOT read networks", async () => {
      await seedNetwork("network-1");
      const db = getUnauthenticatedContext();
      await assertFails(getDoc(doc(db, "networks", "network-1")));
    });

    it("NET-003: Clients CANNOT create networks", async () => {
      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertFails(
        setDoc(doc(db, "networks", "new-network"), {
          name: "Client Network",
        })
      );
    });

    it("NET-004: Clients CANNOT update networks", async () => {
      await seedNetwork("network-1");
      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertFails(
        updateDoc(doc(db, "networks", "network-1"), { name: "Hacked" })
      );
    });

    it("NET-005: Clients CANNOT delete networks", async () => {
      await seedNetwork("network-1");
      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertFails(deleteDoc(doc(db, "networks", "network-1")));
    });

    it("NET-006: Cannot list networks", async () => {
      await seedNetwork("network-1");
      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertFails(getDocs(collection(db, "networks")));
    });
  });

  // ===========================================================================
  // 7. COMPLIANCE DOCUMENT TESTS
  // ===========================================================================
  describe("Compliance Documents", () => {
    it("COMP-001: Clients CANNOT read compliance documents", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(doc(db, "compliance", "admin-form-1"), {
          type: "adminResponsibilityForm",
          status: "submitted",
        });
      });

      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertFails(getDoc(doc(db, "compliance", "admin-form-1")));
    });

    it("COMP-002: Clients CANNOT write compliance documents", async () => {
      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertFails(
        setDoc(doc(db, "compliance", "new-form"), {
          type: "adminResponsibilityForm",
          status: "submitted",
        })
      );
    });
  });

  // ===========================================================================
  // 8. VENUE AND ZONE TESTS
  // ===========================================================================
  describe("Venues and Zones", () => {
    beforeEach(async () => {
      await seedOrg(ORG_1_ID);
    });

    it("VENUE-001: Manager can create venues", async () => {
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertSucceeds(
        setDoc(doc(db, "venues", ORG_1_ID, "venues", "new-venue"), {
          name: "New Venue",
        })
      );
    });

    it("VENUE-002: Staff CANNOT create venues", async () => {
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(
        setDoc(doc(db, "venues", ORG_1_ID, "venues", "new-venue"), {
          name: "Staff Venue",
        })
      );
    });

    it("VENUE-003: Manager can update venues", async () => {
      await seedVenue(ORG_1_ID, "venue-1");
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertSucceeds(
        updateDoc(doc(db, "venues", ORG_1_ID, "venues", "venue-1"), {
          name: "Updated Venue",
        })
      );
    });

    it("VENUE-004: Only owner/admin can delete venues", async () => {
      await seedVenue(ORG_1_ID, "venue-1");
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertFails(deleteDoc(doc(db, "venues", ORG_1_ID, "venues", "venue-1")));
    });

    it("VENUE-005: Owner can delete venues", async () => {
      await seedVenue(ORG_1_ID, "venue-1");
      const db = getAuthenticatedContext(USERS.org1_owner);
      await assertSucceeds(
        deleteDoc(doc(db, "venues", ORG_1_ID, "venues", "venue-1"))
      );
    });

    it("VENUE-006: Cannot list venues", async () => {
      await seedVenue(ORG_1_ID, "venue-1");
      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertFails(
        getDocs(collection(db, "venues", ORG_1_ID, "venues"))
      );
    });
  });

  // ===========================================================================
  // 9. ATTENDANCE RECORDS TESTS
  // ===========================================================================
  describe("Attendance Records", () => {
    beforeEach(async () => {
      await seedOrg(ORG_1_ID);
    });

    it("ATT-001: Scheduler can create attendance records", async () => {
      const db = getAuthenticatedContext(USERS.org1_scheduler);
      await assertSucceeds(
        setDoc(doc(db, "attendance_records", ORG_1_ID, "records", "record-1"), {
          userId: USERS.org1_staff.uid,
          timestamp: new Date(),
          status: "present",
        })
      );
    });

    it("ATT-002: Staff CANNOT create attendance records", async () => {
      const db = getAuthenticatedContext(USERS.org1_staff);
      await assertFails(
        setDoc(doc(db, "attendance_records", ORG_1_ID, "records", "record-1"), {
          userId: USERS.org1_staff.uid,
          timestamp: new Date(),
          status: "present",
        })
      );
    });

    it("ATT-003: Manager can delete attendance records", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(
          doc(db, "attendance_records", ORG_1_ID, "records", "record-1"),
          { userId: USERS.org1_staff.uid, timestamp: new Date(), status: "present" }
        );
      });

      const db = getAuthenticatedContext(USERS.org1_manager);
      await assertSucceeds(
        deleteDoc(doc(db, "attendance_records", ORG_1_ID, "records", "record-1"))
      );
    });

    it("ATT-004: Scheduler CANNOT delete attendance records", async () => {
      await testEnv.withSecurityRulesDisabled(async (context) => {
        const db = context.firestore();
        await setDoc(
          doc(db, "attendance_records", ORG_1_ID, "records", "record-1"),
          { userId: USERS.org1_staff.uid, timestamp: new Date(), status: "present" }
        );
      });

      const db = getAuthenticatedContext(USERS.org1_scheduler);
      await assertFails(
        deleteDoc(doc(db, "attendance_records", ORG_1_ID, "records", "record-1"))
      );
    });
  });

  // ===========================================================================
  // 10. LEGACY MEMBERSHIP DOCUMENT ROLE CHECKING
  // ===========================================================================
  describe("Legacy Membership Document Role Checking", () => {
    it("LEGACY-001: User with legacy membership doc can read org", async () => {
      await seedOrg(ORG_1_ID);
      // Create a user without token claims but with membership doc
      const legacyUser = { uid: "legacy-user", token: {} };
      await seedMembership(legacyUser.uid, ORG_1_ID, ["admin"]);

      const db = getAuthenticatedContext(legacyUser);
      await assertSucceeds(getDoc(doc(db, "orgs", ORG_1_ID)));
    });

    it("LEGACY-002: User with legacy admin membership can update org", async () => {
      await seedOrg(ORG_1_ID);
      const legacyUser = { uid: "legacy-admin", token: {} };
      await seedMembership(legacyUser.uid, ORG_1_ID, ["admin"]);

      const db = getAuthenticatedContext(legacyUser);
      await assertSucceeds(
        updateDoc(doc(db, "orgs", ORG_1_ID), { name: "Legacy Update" })
      );
    });

    it("LEGACY-003: User with legacy manager membership can write schedules", async () => {
      await seedOrg(ORG_1_ID);
      const legacyUser = { uid: "legacy-manager", token: {} };
      await seedMembership(legacyUser.uid, ORG_1_ID, ["manager"]);

      const db = getAuthenticatedContext(legacyUser);
      await assertSucceeds(
        setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "legacy-schedule"), {
          name: "Legacy Schedule",
          status: "draft",
        })
      );
    });

    it("LEGACY-004: User with legacy staff membership can read but not write schedules", async () => {
      await seedOrg(ORG_1_ID);
      await seedSchedule(ORG_1_ID, "schedule-1");
      const legacyUser = { uid: "legacy-staff", token: {} };
      await seedMembership(legacyUser.uid, ORG_1_ID, ["staff"]);

      const db = getAuthenticatedContext(legacyUser);
      // Can read
      await assertSucceeds(
        getDoc(doc(db, "orgs", ORG_1_ID, "schedules", "schedule-1"))
      );
      // Cannot write
      await assertFails(
        setDoc(doc(db, "orgs", ORG_1_ID, "schedules", "new-schedule"), {
          name: "Unauthorized",
        })
      );
    });
  });
});
