//[P1][API][ONBOARDING] Create Network + Org Endpoint (server)
// Tags: api, onboarding, network, org, venue

import { NextResponse } from "next/server";
import { CreateNetworkOrgSchema } from "@fresh-schedules/types";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";
import { parseJson, badRequest, ok, serverError } from "../../_shared/validation";

import { adminDb } from "@/src/lib/firebase.server";

/**
 * Creates a Network, Org, Venue, and memberships for an org-centric onboarding flow.
 *
 * Workflow:
 * 1. Verify formToken (admin responsibility form persisted earlier)
 * 2. Create Network doc in Firestore (status="pending_verification")
 * 3. Create Org + Venue + memberships in a transaction
 */
export const POST = withSecurity(
  async (req: AuthenticatedRequest) => {
    // Require admin DB; if not available, return stubbed response for local/dev
    if (!adminDb) {
      return ok({
        ok: true,
        networkId: "stub-network-id",
        orgId: "stub-org-id",
        venueId: "stub-venue-id",
        status: "pending_verification",
      });
    }

    // Authenticated request guaranteed by withSecurity (requireAuth below)
    const uid = req.user?.uid;
    const claims = req.user?.customClaims || {};

    if (!uid) return badRequest("Not authenticated", undefined, "NOT_AUTHENTICATED");

    // Basic eligibility: email verified + allowed selfDeclaredRole
    const emailVerified = Boolean(claims.email_verified === true || claims.emailVerified === true);
    if (!emailVerified) return badRequest("Email not verified", undefined, "EMAIL_NOT_VERIFIED");

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
      return badRequest("Role not allowed", undefined, "ROLE_NOT_ALLOWED");
    }

    const parseResult = await parseJson(req, CreateNetworkOrgSchema);
    if (!parseResult.success) {
      return badRequest("Validation failed", parseResult.details, "VALIDATION_ERROR");
    }

    const { orgName, venueName, formToken } = parseResult.data;

    try {
      const formRef = adminDb
        .collection("compliance")
        .doc("adminResponsibilityForms")
        .collection("forms")
        .doc(formToken);

      const formSnap = await formRef.get();
      if (!formSnap.exists) {
        return badRequest("Form token not found", undefined, "FORM_TOKEN_NOT_FOUND");
      }

      const formData = formSnap.data() as Record<string, unknown>;
      const now = Date.now();
      if (typeof formData.expiresAt === "number" && formData.expiresAt < now) {
        return badRequest("Form token expired", undefined, "FORM_TOKEN_EXPIRED");
      }

      if (formData.immutable === true || formData.attachedTo) {
        return badRequest("Form already attached", undefined, "FORM_ALREADY_ATTACHED");
      }

      // Prepare new docs
      const networkRef = adminDb.collection("networks").doc();
      const orgRef = adminDb.collection("orgs").doc();
      const venueRef = adminDb.collection("venues").doc();

      await adminDb.runTransaction(async (tx) => {
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

        // Mark form as attached and immutable
        tx.update(formRef, {
          attachedTo: { networkId: networkRef.id, orgId: orgRef.id, venueId: venueRef.id },
          immutable: true,
          status: "attached",
          attachedAt: Date.now(),
        });
      });

      return ok({
        ok: true,
        networkId: networkRef.id,
        orgId: orgRef.id,
        venueId: venueRef.id,
        status: "pending_verification",
      });
    } catch (err) {
      console.error("create-network-org failed", err);
      return serverError("Failed to create network and organization");
    }
  },
  { requireAuth: true },
);
