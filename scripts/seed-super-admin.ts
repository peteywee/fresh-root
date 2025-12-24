// [P0][SCRIPT][ADMIN] Seed super admin user
// Tags: P0, SCRIPT, ADMIN, SETUP
/**
 * Creates the super admin user in Firebase Auth.
 * 
 * Run with: npx ts-node scripts/seed-super-admin.ts
 * Or: pnpm tsx scripts/seed-super-admin.ts
 * 
 * Requires GOOGLE_APPLICATION_CREDENTIALS or Firebase Admin SDK credentials.
 */

import admin from "firebase-admin";

// Super admin credentials
const SUPER_ADMIN_EMAIL = "admin@email.com";
const SUPER_ADMIN_PASSWORD = "pass1234";

async function seedSuperAdmin() {
  // Initialize Firebase Admin (uses GOOGLE_APPLICATION_CREDENTIALS by default)
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const auth = admin.auth();

  try {
    // Try to get existing user
    let user: admin.auth.UserRecord;
    
    try {
      user = await auth.getUserByEmail(SUPER_ADMIN_EMAIL);
      console.log(`✓ Super admin user already exists: ${user.uid}`);
    } catch (error) {
      // User doesn't exist, create them
      if ((error as { code?: string }).code === "auth/user-not-found") {
        user = await auth.createUser({
          email: SUPER_ADMIN_EMAIL,
          password: SUPER_ADMIN_PASSWORD,
          emailVerified: true,
          displayName: "Super Admin",
        });
        console.log(`✓ Created super admin user: ${user.uid}`);
      } else {
        throw error;
      }
    }

    // Set custom claims for admin role
    await auth.setCustomUserClaims(user.uid, {
      roles: ["admin"],
    });
    console.log(`✓ Set admin role in custom claims`);

    console.log("\n=== Super Admin Created ===");
    console.log(`Email: ${SUPER_ADMIN_EMAIL}`);
    console.log(`Password: ${SUPER_ADMIN_PASSWORD}`);
    console.log(`UID: ${user.uid}`);
    console.log(`Roles: ["admin"]`);
    console.log("\nThis user can:");
    console.log("  - Skip onboarding and go straight to dashboard");
    console.log("  - Access /ops dashboard");
    console.log("  - Access all organizations");
    console.log("  - Perform any action in the system");

  } catch (error) {
    console.error("Error seeding super admin:", error);
    process.exit(1);
  }

  process.exit(0);
}

seedSuperAdmin();
