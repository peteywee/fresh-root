// [P1][APP][SERVER] Schedules page server data fetcher
// Tags: P1, APP, SERVER, SCHEDULES
import { cookies } from "next/headers";

import { getFirebaseAdminAuth } from "../../../../lib/firebase-admin";

/**
 * Server-side function to get the authenticated user's organization ID
 * This uses the session cookie to verify the user and extract org context
 */
export async function getAuthenticatedOrgId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      console.warn("No session cookie found");
      return null;
    }

    const auth = getFirebaseAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Extract orgId from custom claims
    const _orgId = decodedClaims.orgId as string | undefined;

    if (!orgId) {
      console.warn("No orgId in custom claims for user:", decodedClaims.uid);
      return null;
    }

    return orgId;
  } catch (error) {
    console.error("Failed to get authenticated org ID:", error);
    return null;
  }
}

/**
 * Server-side function to fetch recent schedules for an organization
 * Uses Firestore Admin SDK for server-side queries
 */
export async function fetchSchedules(orgId: string, _limit = 12) {
  try {
    // In production, fetch from Firestore using Admin SDK
    // For now, return mock data
    const mockSchedules = [
      {
        id: "schedule-1",
        orgId,
        name: "Week 1 Schedule",
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        venueId: "venue-main",
        status: "published",
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
      {
        id: "schedule-2",
        orgId,
        name: "Week 2 Schedule",
        weekStart: new Date().toISOString(),
        venueId: "venue-main",
        status: "draft",
        createdAt: Date.now(),
      },
    ];

    return mockSchedules;
  } catch (error) {
    console.error("Failed to fetch schedules:", error);
    return [];
  }
}
