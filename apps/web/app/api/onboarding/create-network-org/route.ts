// [P1][ONBOARDING][ORG][API] Create organization network endpoint with orgId cookie and Firestore persistence
// Tags: P1, ONBOARDING, ORG, API, SDK_FACTORY, A3, B1, B2

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateNetworkSchema } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { ok, serverError } from "../../_shared/validation";
import { FLAGS } from "../../../../src/lib/features";

/**
 * POST /api/onboarding/create-network-org
 * Create organization network and set orgId cookie
 */
export const POST = createAuthenticatedEndpoint({
  input: CreateNetworkSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof CreateNetworkSchema>;
      const userId = context.auth?.userId;

      if (!userId) {
        return serverError("User ID is required");
      }

      const org = {
        id: `org-${Date.now()}`,
        name: typedInput.organizationName,
        type: typedInput.type,
        ownerId: userId,
        createdAt: Date.now(),
        status: "active",
      };

      // B1 & B2: Write org document and membership to Firestore if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();

        // B1: Write organization document to Firestore
        const orgData = {
          name: org.name,
          type: org.type,
          ownerId: userId,
          createdAt: org.createdAt,
          status: org.status,
        };
        await db.collection('organizations').doc(org.id).set(orgData);

        // B2: Create membership document for org creator with org_owner role
        const membershipData = {
          userId,
          orgId: org.id,
          role: "org_owner",
          status: "active",
          joinedAt: org.createdAt,
        };
        await db.collection('organizations').doc(org.id).collection('members').doc(userId).set(membershipData);
      }

      // A3: Set orgId cookie for session persistence
      const response = NextResponse.json(ok(org));
      response.cookies.set('orgId', org.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create organization network";
      console.error("Create organization network failed", {
        error: message,
        userId: context.auth?.userId,
      });
      return serverError("Failed to create organization network");
    }
  },
});
