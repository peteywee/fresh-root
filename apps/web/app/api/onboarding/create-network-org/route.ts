//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
// Tags: api, onboarding, network, org, venue, membership
/**
 * @fileoverview
 * API endpoint for v14 org onboarding flow: create network, org, venue, and initial membership.
 * Uses Zod-validated CreateOrgOnboardingSchema, creates v14-compliant Firestore docs, and marks onboarding complete.
 */
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";
// Zod schema for onboarding payload validation
import { createOrgOnboardingSchema } from "../../_shared/validation";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function createNetworkOrgHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
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

  const adminDb = injectedAdminDb as NonNullable<typeof importedAdminDb>;

  // Authenticated request guaranteed by withSecurity (requireAuth below)
  const uid = req.user?.uid;
  const claims = req.user?.customClaims || {};

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

  let bodyUnknown: unknown;
  try {
    bodyUnknown = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = createOrgOnboardingSchema.safeParse(bodyUnknown);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const { orgName, venueName, formToken, location } = parsed.data;
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
    const nowMs = Date.now();
    if (typeof formData.expiresAt === "number" && formData.expiresAt < nowMs) {
      return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
    }

    if (formData.immutable === true || formData.attachedTo) {
      return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
    }

    // Prepare new docs
    const networkRef = adminDb.collection("networks").doc();
    const orgRef = adminDb.collection("orgs").doc();
    const venueRef = adminDb.collection("venues").doc();

    // Membership doc id in the existing global memberships collection
    const membershipId = `${uid}_org_${orgRef.id}`;
    const membershipRef = adminDb.collection("memberships").doc(membershipId);

    await adminDb.runTransaction(
      async (tx: {
        set: (...args: unknown[]) => unknown;
        update: (...args: unknown[]) => unknown;
      }) => {
        const createdAt = nowMs;

        // 1) Network (v14-compliant fields)
        tx.set(networkRef, {
          id: networkRef.id,
          slug: networkRef.id,
          displayName: orgName || `Network ${new Date().toISOString()}`,
          kind: "independent_org",
          ownerUserId: uid,
          status: "pending_verification",
          createdAt,
          updatedAt: createdAt,
          adminFormToken: formToken,
        });

        // 2) Org (v14-compliant fields)
        tx.set(orgRef, {
          id: orgRef.id,
          networkId: networkRef.id,
          name: orgName || "Org",
          ownerId: uid,
          memberCount: 1,
          status: "trial",
          createdAt,
          updatedAt: createdAt,
        });

        // 3) Venue (v14-compliant fields, with optional location/timezone)
        tx.set(venueRef, {
          id: venueRef.id,
          name: venueName || "Main Venue",
          orgId: orgRef.id,
          networkId: networkRef.id,
          createdBy: uid,
          createdAt,
          updatedAt: createdAt,
          ...(location &&
          typeof location === "object" &&
          Object.keys(location as Record<string, unknown>).length > 0
            ? {
                location: {
                  street1: (location as Record<string, unknown>).street1 || "",
                  street2: (location as Record<string, unknown>).street2 || "",
                  city: (location as Record<string, unknown>).city || "",
                  state: (location as Record<string, unknown>).state || "",
                  postalCode: (location as Record<string, unknown>).postalCode || "",
                  countryCode: (location as Record<string, unknown>).countryCode || "",
                  timeZone: (location as Record<string, unknown>).timeZone || "",
                },
              }
            : {}),
        });

        // 4) Copy admin responsibility form into a network-scoped compliance document
        const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");

        tx.set(complianceRef, {
          ...formData,
          networkId: networkRef.id,
          orgId: orgRef.id,
          venueId: venueRef.id,
          attachedFromToken: formToken,
          attachedBy: uid,
          attachedAt: createdAt,
        });

        // 5) Mark original form as attached + immutable
        tx.update(formRef, {
          attachedTo: {
            networkId: networkRef.id,
            orgId: orgRef.id,
            venueId: venueRef.id,
          },
          immutable: true,
          status: "attached",
          attachedAt: createdAt,
        });

        // 6) Create global membership so legacy/org-based rules still work
        tx.set(membershipRef, {
          userId: uid,
          orgId: orgRef.id,
          networkId: networkRef.id,
          roles: ["org_owner", "admin", "manager"],
          createdAt,
          createdBy: uid,
        });
      },
    );

    // Mark the creating user's onboarding as complete (best-effort).
    try {
      await markOnboardingComplete({
        adminDb,
        uid: uid as string,
        intent: "create_org",
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
      });
    } catch {
      // Swallow errors to preserve original endpoint semantics.
    }

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
