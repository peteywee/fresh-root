// [P1][UX][CODE] Server-side org cookie helper
// Tags: P1, UX, CODE, ORG, SERVER
import { cookies } from "next/headers";

/**
 * Read orgId from cookie in server components
 * Usage: const orgId = await getOrgIdFromCookie();
 */
export async function getOrgIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const orgIdCookie = cookieStore.get("orgId");
  return orgIdCookie?.value || null;
}
