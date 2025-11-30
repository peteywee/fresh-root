// [P1][APP][SEED] Firestore emulator seeding script
// Tags: P1, APP, SEED

/**
 * Seed the Firestore emulator with test data.
 *
 * Usage:
 *   pnpm db:seed              # Seeds with default test data
 *   NEXT_PUBLIC_USE_EMULATORS=true pnpm db:seed  # Explicitly enable emulator
 *
 * Prerequisites:
 *   - Firebase emulator must be running: firebase emulators:start
 *   - FIRESTORE_EMULATOR_HOST should be set (default: 127.0.0.1:8080)
 */

import { getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

// Initialize Firebase Admin with emulator
const projectId = process.env.FIREBASE_PROJECT_ID || "demo-fresh";
const emulatorsEnabled = process.env.NEXT_PUBLIC_USE_EMULATORS === "true";

console.log(`🌱 Seeding Firestore (${emulatorsEnabled ? "EMULATOR" : "LIVE"})...`);
console.log(`   Project: ${projectId}`);

// Initialize app
if (!getApps().length) {
  initializeApp({
    projectId,
  });
}

const db = getFirestore();

// Enable emulator if requested
if (emulatorsEnabled) {
  process.env.FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:8080";
  console.log(`   Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

/**
 * Sample test data for networks, organizations, and memberships
 */
const testData = {
  networks: [
    {
      id: "network-001",
      name: "Test Network Alpha",
      type: "corporate" as const,
      createdAt: Timestamp.now(),
      status: "active",
    },
    {
      id: "network-002",
      name: "Test Network Beta",
      type: "organization" as const,
      createdAt: Timestamp.now(),
      status: "active",
    },
  ],
  organizations: [
    {
      id: "org-001",
      name: "Test Organization 1",
      networkId: "network-001",
      createdAt: Timestamp.now(),
      status: "active",
    },
    {
      id: "org-002",
      name: "Test Organization 2",
      networkId: "network-002",
      createdAt: Timestamp.now(),
      status: "active",
    },
  ],
  users: [
    {
      id: "user-001",
      email: "admin@test.local",
      displayName: "Admin User",
      createdAt: Timestamp.now(),
      roles: ["admin"],
    },
    {
      id: "user-002",
      email: "member@test.local",
      displayName: "Member User",
      createdAt: Timestamp.now(),
      roles: ["member"],
    },
  ],
  memberships: [
    {
      id: "membership-001",
      userId: "user-001",
      organizationId: "org-001",
      role: "admin",
      joinedAt: Timestamp.now(),
      status: "active",
    },
    {
      id: "membership-002",
      userId: "user-002",
      organizationId: "org-001",
      role: "member",
      joinedAt: Timestamp.now(),
      status: "active",
    },
  ],
};

/**
 * Seed collections with test data
 */
async function seedCollections() {
  try {
    // Seed networks
    console.log("\n  📝 Seeding networks...");
    for (const network of testData.networks) {
      await db.collection("networks").doc(network.id).set(network);
      console.log(`     ✓ ${network.name}`);
    }

    // Seed organizations
    console.log("\n  📝 Seeding organizations...");
    for (const org of testData.organizations) {
      await db.collection("organizations").doc(org.id).set(org);
      console.log(`     ✓ ${org.name}`);
    }

    // Seed users
    console.log("\n  📝 Seeding users...");
    for (const user of testData.users) {
      await db.collection("users").doc(user.id).set(user);
      console.log(`     ✓ ${user.email}`);
    }

    // Seed memberships
    console.log("\n  📝 Seeding memberships...");
    for (const membership of testData.memberships) {
      await db.collection("memberships").doc(membership.id).set(membership);
      console.log(`     ✓ Membership ${membership.id}`);
    }

    console.log("\n✅ Seeding complete!");
    console.log("\n📊 Seeded collections:");
    console.log(`   • networks: ${testData.networks.length} documents`);
    console.log(`   • organizations: ${testData.organizations.length} documents`);
    console.log(`   • users: ${testData.users.length} documents`);
    console.log(`   • memberships: ${testData.memberships.length} documents`);

    if (emulatorsEnabled) {
      console.log("\n📱 View data in Emulator UI: http://127.0.0.1:4000/firestore");
    }
  } catch (error) {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  }
}

/**
 * Main entry point
 */
async function main() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌱 Fresh Root Firestore Emulator Seeder");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  await seedCollections();

  // Close the app connection
  process.exit(0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
