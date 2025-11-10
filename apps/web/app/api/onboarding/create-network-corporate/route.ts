//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
// Tags: api, onboarding, network, corporate, membership

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

export async function createNetworkCorporateHandler(
  req: AuthenticatedRequest & {
    user?: { uid: string; customClaims?: Record<string, unknown> };
  },
  injectedAdminDb = importedAdminDb,
) {
  if (!injectedAdminDb) {
    // Stub for local/dev without Firestore
    return NextResponse.json(
      {
        ok: true,
        networkId: "stub-network-id",
        corpId: "stub-corp-id",
        status: "pending_verification",
      },
      { status: 200 },
    );
  }

  const adminDb = injectedAdminDb;

  const uid = req.user?.uid;
  const claims = req.user?.customClaims || {};

  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
  if (!emailVerified) return NextResponse.json({ error: "email_not_verified" }, { status: 403 });

  // For corporate creation, roles must be owner/founder/director or corporate_hq
  const allowedRoles = ["owner_founder_director", "corporate_hq"];
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

  const { corporateName, brandName, industry, approxLocations, formToken } =
    (body as Record<string, unknown>) || {};

  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });
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

    const networkRef = adminDb.collection("networks").doc();
    const corporateRef = networkRef.collection("corporate");
    const corpRef = corporateRef.doc();

    await adminDb.runTransaction(
      async (tx: {
        set: (...args: unknown[]) => unknown;
        update: (...args: unknown[]) => unknown;
      }) => {
        const createdAt = nowMs;

        // 1) Network
        tx.set(networkRef, {
          name: corporateName || `Corporate Network ${new Date().toISOString()}`,
          status: "pending_verification",
          kind: "corporate_network",
          industry: industry || null,
          approxLocations: approxLocations || null,
          createdAt,
          createdBy: uid,
          adminFormToken: formToken,
        });

        // 2) Corporate node under this network
        tx.set(corpRef, {
          id: corpRef.id,
          networkId: networkRef.id,
          name: corporateName || "Corporate",
          brandName: brandName || null,
          industry: industry || null,
          approxLocations: approxLocations || null,
          contactUserId: uid,
          createdAt,
          createdBy: uid,
        });

        // 3) Compliance doc under network
        const complianceRef = networkRef.collection("compliance").doc("adminResponsibilityForm");

        tx.set(complianceRef, {
          ...formData,
          networkId: networkRef.id,
          corporateId: corpRef.id,
          attachedFromToken: formToken,
          attachedBy: uid,
          attachedAt: createdAt,
        });

        // 4) Mark original form attached + immutable
        tx.update(formRef, {
          attachedTo: { networkId: networkRef.id, corpId: corpRef.id },
          immutable: true,
          status: "attached",
          attachedAt: createdAt,
        });

        // 5) Global membership for creator
        const membershipId = `${uid}_network_${networkRef.id}`;
        const membershipRef = adminDb.collection("memberships").doc(membershipId);
        tx.set(membershipRef, {
          userId: uid,
          networkId: networkRef.id,
          roles: ["network_owner", "corporate_admin"],
          createdAt,
          createdBy: uid,
        });
      },
    );

    // Best-effort: mark onboarding complete for the creator
    try {
      await markOnboardingComplete({
        adminDb,
        uid: uid as string,
        intent: "create_corporate",
        networkId: networkRef.id,
        orgId: corpRef.id,
        venueId: undefined,
      });
    } catch {
      // swallow errors to preserve original semantics
    }

    return NextResponse.json(
      {
        ok: true,
        networkId: networkRef.id,
        corpId: corpRef.id,
        status: "pending_verification",
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("create-network-corporate failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

export const POST = withSecurity(
  async (req: any) => createNetworkCorporateHandler(req, importedAdminDb),
  { requireAuth: true },
);
