//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
// Tags: api, onboarding, network, org, venue

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function createNetworkOrgHandler(
  req: AuthenticatedRequest,
  injectedAdminDb = importedAdminDb,
) {
  // Use injected adminDb (tests) or imported adminDb for runtime
  if (!injectedAdminDb) {
    // In dev/local mode, return a stub response so the frontend can be exercised without Firestore
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

  const adminDb = injectedAdminDb;

  // Authenticated request guaranteed by withSecurity (requireAuth below)
  const uid = req.user?.uid;
  const claims = (req.user as any)?.customClaims || {};

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  // Basic eligibility: email verified + allowed selfDeclaredRole
  const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
  if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

  const allowedRoles = [
    "owner_founder_director",
    "manager_supervisor",
    "corporate_hq",
    "manager",
    "org_owner",
  ];
  const declared =
    (claims.selfDeclaredRole as string | undefined) || (claims.role as string | undefined);
  if (!declared || !allowedRoles.includes(declared)) {
    return NextResponse.json({ error: "role_not_allowed" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { orgName, venueName, formToken } = (body as Record<string, unknown>) || {};
  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });

  // Prevent path traversal attacks by ensuring formToken is a valid document ID segment.
  if (String(formToken).includes("/")) {
    return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
  }

  try {
    const formsRoot = adminDb
      .collection("compliance")
      .doc("adminResponsibilityForms")
      .collection("forms");
    const formRef = formsRoot.doc(String(formToken));

    const formSnap = await formRef.get();
    if (!formSnap.exists) {
      return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
    }

    const formData = formSnap.data() as Record<string, unknown>;
    const now = Date.now();
    if (typeof formData.expiresAt === "number" && formData.expiresAt < now) {
      return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
    }

    if (formData.immutable === true || formData.attachedTo) {
      return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
    }

    // Prepare new docs
    const networkRef = adminDb.collection("networks").doc();
    const orgRef = adminDb.collection("orgs").doc();
    const venueRef = adminDb.collection("venues").doc();

    await adminDb.runTransaction(
      async (tx: any) => {
        tx.set(networkRef, {
          name: orgName || `Network ${new Date().toISOString()}`,
          status: "pending_verification",
          createdAt: Date.now(),
          adminFormToken: formToken,
        });

        tx.set(orgRef, {
          name: orgName || "Org",
          networkId: networkRef.id,
          createdAt: Date.now(),
        });

        tx.set(venueRef, {
          name: venueName || "Main Venue",
          orgId: orgRef.id,
          networkId: networkRef.id,
          createdAt: Date.now(),
        });

        // Copy admin responsibility form into a network-scoped compliance document
        const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");
        tx.set(complianceRef, {
          ...formData,
          networkId: networkRef.id,
          orgId: orgRef.id,
          venueId: venueRef.id,
          attachedFromToken: formToken,
          attachedBy: uid,
          attachedAt: now,
        });

        // Mark form as attached and immutable
        tx.update(formRef, {
          attachedTo: { networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id },
          immutable: true,
          status: "attached",
          attachedAt: Date.now(),
        });
      },
    );

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

// Keep Next.js route export for runtime (secured)
export const POST = withSecurity(
  async (req: AuthenticatedRequest) => createNetworkOrgHandler(req, importedAdminDb),
  { requireAuth: true },
);
