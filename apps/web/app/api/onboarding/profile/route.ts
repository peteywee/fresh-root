// [P0][ONBOARDING][API] Onboarding profile endpoint
import { NextResponse } from "next/server";
import { z } from "zod";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

const ProfileSchema = z.object({
  fullName: z.string().min(1),
  preferredName: z.string().min(1),
  phone: z.string().min(4),
  timeZone: z.string().min(1),
  selfDeclaredRole: z.string().min(1),
});

export const POST = createAuthenticatedEndpoint({
  input: ProfileSchema,
  handler: async ({ input, context }) => {
    const uid = context.auth?.userId;
    if (!uid) {
      return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
    }
    const profile = input;
    const adminDb = importedAdminDb;
    if (!adminDb) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
    const now = Date.now();
    const userRef = adminDb.collection("users").doc(uid);
    await userRef.set({
      profile: { ...profile, updatedAt: now },
      onboarding: { status: "in_progress", stage: "profile_complete", lastUpdatedAt: now },
    }, { merge: true });
    return NextResponse.json({ ok: true }, { status: 200 });
  },
});
