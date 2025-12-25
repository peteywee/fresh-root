// [P1][OPS][CODE] Observability dashboard page (admin-gated)
// Tags: P1, OPS, CODE, dashboard, observability

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getFirebaseAdminAuth, getFirebaseAdminDb } from "../../../lib/firebase-admin";
import OpsClient from "./OpsClient";

export const dynamic = "force-dynamic";

async function requireOpsSuperAccess(): Promise<{ orgId: string }> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    redirect("/login");
  }

  const orgId = cookieStore.get("orgId")?.value;
  if (!orgId) {
    redirect("/onboarding");
  }

  const auth = getFirebaseAdminAuth();
  let decodedClaims: Awaited<ReturnType<typeof auth.verifySessionCookie>>;

  try {
    decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
  } catch {
    redirect("/login");
  }

  const db = getFirebaseAdminDb();
  const memberDoc = await db
    .collection("organizations")
    .doc(orgId)
    .collection("members")
    .doc(decodedClaims.uid)
    .get();

  const role = memberDoc.exists ? (memberDoc.data()?.role as string | undefined) : undefined;
  if (role !== "admin" && role !== "org_owner") {
    redirect("/");
  }

  return { orgId };
}

export default async function OpsPage() {
  const { orgId } = await requireOpsSuperAccess();
  return <OpsClient orgId={orgId} />;
}
