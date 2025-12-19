// [P1][ONBOARDING][JOIN][API] Join organization with token validation and membership creation
// Tags: P1, ONBOARDING, JOIN, API, SDK_FACTORY, A4, A5

import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { JoinWithTokenSchema } from "@fresh-schedules/types";
import { getFirestore } from "firebase-admin/firestore";
import { NextResponse } from "next/server";

import { ok, serverError, badRequest } from "../../_shared/validation";
import { FLAGS } from "../../../../src/lib/features";

/**
 * POST /api/onboarding/join-with-token
 * Join an organization using an invite token with validation and membership creation
 */
export const POST = createAuthenticatedEndpoint({
  input: JoinWithTokenSchema,
  handler: async ({ request: _request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by SDK factory
      const typedInput = input as z.infer<typeof JoinWithTokenSchema>;
      const { joinToken } = typedInput;
      const userId = context.auth?.userId;

      if (!userId) {
        return badRequest("User ID is required");
      }

      // A4: Validate invite token if FIRESTORE_WRITES enabled
      if (FLAGS.FIRESTORE_WRITES) {
        const db = getFirestore();
        const tokenDocRef = db.collection('invite_tokens').doc(joinToken as string);
        const tokenDoc = await tokenDocRef.get();

        if (!tokenDoc.exists) {
          return badRequest("Invalid invite token");
        }

        const tokenData = tokenDoc.data();

        // Check if token is already used
        if (tokenData?.used) {
          return badRequest("Invite token has already been used");
        }

        // Check if token is expired
        if (tokenData?.expiresAt && tokenData.expiresAt < Date.now()) {
          return badRequest("Invite token has expired");
        }

        const orgId = tokenData?.orgId;
        if (!orgId) {
          return badRequest("Invalid token: missing organization ID");
        }

        // A5: Create membership document
        const membershipData = {
          userId,
          orgId,
          role: tokenData.role || "member",
          status: "active",
          joinedAt: Date.now(),
          invitedBy: tokenData.createdBy,
        };

        await db.collection('organizations').doc(orgId as string).collection('members').doc(userId).set(membershipData);

        // Mark token as used (part of B4, but doing it here for atomicity)
        await tokenDocRef.update({
          used: true,
          usedBy: userId,
          usedAt: Date.now(),
        });

        // Set orgId cookie
        const response = NextResponse.json(ok({
          ...membershipData,
          joinedAt: Date.now(),
        }));

        response.cookies.set('orgId', orgId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          path: '/',
        });

        return response;
      }

      // Fallback for when FIRESTORE_WRITES is disabled
      const result = {
        userId,
        token: joinToken,
        joinedAt: Date.now(),
        role: "member",
        status: "pending_approval",
      };
      return ok(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to join with token";
      console.error("Join with token failed", {
        error: message,
        userId: context.auth?.userId,
        token: input instanceof Object && "joinToken" in input ? (input as any).joinToken : "unknown",
      });
      return serverError("Failed to join with token");
    }
  },
});
