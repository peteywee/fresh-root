// [P0][AUTH][OPS] Super admin access check for ops pages
// Tags: P0, AUTH, OPS, SECURITY
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getFirebaseAdminAuth, getFirebaseAdminDb } from "../../../lib/firebase-admin";

/**
 * Require super admin access for ops dashboard pages.
 * Checks for 'admin' role (super admin) which has system-wide access.
 */
export async function requireOpsSuperAccess(): Promise<{ orgId: string; userId: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  
  if (!sessionCookie) {
    redirect("/login?redirect=/ops");
  }

  const auth = getFirebaseAdminAuth();
  let decodedClaims: Awaited<ReturnType<typeof auth.verifySessionCookie>>;

  try {
    decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
  } catch {
    redirect("/login?redirect=/ops");
  }

  // Check custom claims for admin role (super admin)
  const roles = decodedClaims.roles as string[] | undefined;
  if (roles?.includes("admin")) {
    // Super admin - return with system-level access
    return { 
      orgId: cookieStore.get("orgId")?.value || "system", 
      userId: decodedClaims.uid 
    };
  }

  // Fallback: check org membership for admin role
  const orgId = cookieStore.get("orgId")?.value;
  if (!orgId) {
    redirect("/");
  }

  const db = getFirebaseAdminDb();
  const memberDoc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("members")
    .doc(decodedClaims.uid)
    .get();

  const role = memberDoc.exists ? (memberDoc.data()?.role as string | undefined) : undefined;
  
  // Only admin (super admin) can access ops - org_owner is NOT enough
  if (role !== "admin") {
    redirect("/");
  }

  return { orgId, userId: decodedClaims.uid };
}
