// [P0][ONBOARDING][API] Create corporate network endpoint
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

// Schema for corporate network creation
const CreateNetworkCorporateSchema = z.object({
  corporateName: z.string(),
  brandName: z.string().optional(),
  industry: z.string().optional(),
  approxLocations: z.number().optional(),
  formToken: z.string(),
});

//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
//[P1][API][ONBOARDING] Create Network + Corporate Endpoint (server)
// Tags: api, onboarding, network, corporate, membership, events

/* eslint-disable @typescript-eslint/no-explicit-any */

import { logEvent } from "@/src/lib/eventLog";
import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { markOnboardingComplete } from "@/src/lib/userOnboarding";

async function createNetworkCorporateHandlerImpl(
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

  const adminDb = injectedAdminDb; // rely on injected type

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

  // Validate input with Zod
  const parseResult = CreateNetworkCorporateSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parseResult.error.issues },
      { status: 422 },
    );
  }

  const { corporateName, brandName, industry, approxLocations, formToken } = parseResult.data;

  if (!formToken) return NextResponse.json({ error: "missing_form_token" }, { status: 422 });
  if (String(formToken).includes("/")) {
    return NextResponse.json({ error: "invalid_form_token" }, { status: 400 });
  }

  const formsRoot = adminDb
    .collection("compliance")
    .doc("adminResponsibilityForms")
    .collection("forms");
  const formRef = formsRoot.doc(String(formToken));

  try {
    const formSnap = await formRef.get();
    if (!formSnap.exists) {
      return NextResponse.json({ error: "form_token_not_found" }, { status: 404 });
    }

    const formData = formSnap.data() as Record<string, unknown>;
    const nowMs = Date.now();
    if (typeof formData.expiresAt === "number" && formData.expiresAt < nowMs) {
      return NextResponse.json({ error: "form_token_expired" }, { status: 410 });
    }

    // [SECURITY] Verify token ownership - prevent privilege escalation (Critical)
    if (formData.createdBy !== uid) {
      return NextResponse.json(
        { error: "token_ownership_mismatch", details: "This form token was not created by you" },
        { status: 403 }
      );
    }

    if (formData.immutable === true || formData.attachedTo) {
      return NextResponse.json({ error: "form_already_attached" }, { status: 409 });
    }

    const networkRef = adminDb.collection("networks").doc();
    const corporateCollectionRef = networkRef.collection("corporate");
    const corpRef = corporateCollectionRef.doc();

    await adminDb.runTransaction(async (tx: any) => {
      const createdAt = nowMs;

      // 1) Network
      tx.set(networkRef, {
        id: networkRef.id,
        name: corporateName || `Corporate Network ${new Date().toISOString()}`,
        displayName: corporateName || null,
        status: "pending_verification",
        kind: "corporate_network",
        industry: industry || null,
        approxLocations: approxLocations || null,
        ownerUserId: uid,
        createdAt,
        updatedAt: createdAt,
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
        updatedAt: createdAt,
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
        updatedAt: createdAt,
        createdBy: uid,
      });
    });

    // 6) Mark onboarding complete
    await markOnboardingComplete({
      adminDb,
      uid,
      intent: "create_corporate",
      networkId: networkRef.id,
      orgId: corpRef.id,
      venueId: undefined,
    });

    // 7) Emit platform events
    const now = Date.now();

    // network.created
    await logEvent(adminDb, {
      at: now,
      category: "network",
      type: "network.created",
      actorUserId: uid,
      networkId: networkRef.id,
      payload: {
        source: "onboarding.create-network-corporate",
        kind: "corporate_network",
      },
    });

    // membership.created (network_owner / corporate_admin)
    await logEvent(adminDb, {
      at: now,
      category: "membership",
      type: "membership.created",
      actorUserId: uid,
      networkId: networkRef.id,
      payload: {
        source: "onboarding.create-network-corporate",
        roles: ["network_owner", "corporate_admin"],
      },
    });

    // onboarding.completed (intent: create_corporate)
    await logEvent(adminDb, {
      at: now,
      category: "onboarding",
      type: "onboarding.completed",
      actorUserId: uid,
      networkId: networkRef.id,
      orgId: corpRef.id,
      payload: {
        intent: "create_corporate",
      },
    });

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
  async (req: AuthenticatedRequest, _ctx: unknown) => {
    return createNetworkCorporateHandlerImpl(req, importedAdminDb);
  },
  {
    requireAuth: true,
  },
);
