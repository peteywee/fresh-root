// [P0][API][CODE] Route API route handler
// Tags: P0, API, CODE
import { NextResponse } from "next/server";
import { z } from "zod";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

const ProfileSchema = z.object({
  fullName: z.string().min(1),
  preferredName: z.string().min(1),
  phone: z.string().min(4),
  timeZone: z.string().min(1),
  selfDeclaredRole: z.string().min(1),
});

export async function profileHandler(
  req: AuthenticatedRequest & { user?: { uid: string } },
  injectedAdminDb = importedAdminDb,
) {
  const uid = req.user?.uid;
  if (!uid) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = ProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const profile = parsed.data;
  const adminDb = injectedAdminDb;
  if (!adminDb) {
    // Dev stub: pretend success
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const now = Date.now();
  const userRef = adminDb.collection("users").doc(uid);

  await userRef.set(
    {
      profile: {
        ...profile,
        updatedAt: now,
      },
      onboarding: {
        status: "in_progress",
        stage: "profile_complete",
        lastUpdatedAt: now,
      },
    },
    { merge: true },
  );

  return NextResponse.json({ ok: true }, { status: 200 });
}

export const POST = withSecurity(async (req: AuthenticatedRequest) => profileHandler(req), {
  requireAuth: true,
});
