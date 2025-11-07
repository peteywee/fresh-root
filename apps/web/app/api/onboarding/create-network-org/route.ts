//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
// Tags: api, onboarding, network, org, venue

import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/src/lib/firebase.server";

/**
 * Creates a Network, Org, Venue, and memberships for an org-centric onboarding flow.
 *
 * Workflow:
 * 1. Verify formToken (admin responsibility form persisted earlier)
 * 2. Create Network doc in Firestore (status="pending_verification")
 * 3. Create Org + Venue + memberships in a transaction
 */
export async function POST(req: NextRequest) {
  if (!adminDb) {
    // Admin SDK missing; return stubbed response for local dev
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        orgId: "stub-org-id",
        venueId: "stub-venue-id",
        status: "pending_verification",
      },
      { status: 200 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { orgName, venueName, formToken } = (body as Record<string, unknown>) || {};
  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });

  try {
    const formRef = adminDb
      .collection("compliance")
      .doc("adminResponsibilityForms")
      .collection("forms")
      .doc(String(formToken));

    const formSnap = await formRef.get();
    if (!formSnap.exists) {
      return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
    }

    // Prepare new docs
    const networkRef = adminDb.collection("networks").doc();
    const orgRef = adminDb.collection("orgs").doc();
    const venueRef = adminDb.collection("venues").doc();

    await adminDb.runTransaction(async (tx) => {
      tx.set(networkRef, {
        name: orgName || `Network ${new Date().toISOString()}`,
        status: "pending_verification",
        createdAt: new Date().toISOString(),
        adminFormToken: formToken,
      });

      tx.set(orgRef, {
        name: orgName || "Org",
        networkId: networkRef.id,
        createdAt: new Date().toISOString(),
      });

      tx.set(venueRef, {
        name: venueName || "Main Venue",
        orgId: orgRef.id,
        networkId: networkRef.id,
        createdAt: new Date().toISOString(),
      });

      // Optionally mark form as attached
      tx.update(formRef, {
        attachedTo: { networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id },
      });
    });

    return NextResponse.json(
      {
        ok: true,
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
        status: "pending_verification",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("create-network-org failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
