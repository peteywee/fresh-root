//[P1][API][ONBOARDING] Admin Form Endpoint (server)
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
//[P1][API][ONBOARDING] Admin Form Endpoint (server)
// Tags: api, onboarding, admin-form, compliance

import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";
import { withRequestLogging } from "../../_shared/logging";
import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function adminFormHandler(
  req: AuthenticatedRequest & { user?: { uid: string } },
  injectedAdminDb = importedAdminDb,
) {
  let body: unknown;

  // Authenticated request check: handler expects an authenticated user.
  const uid = req.user?.uid;
  if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parseResult = CreateAdminResponsibilityFormSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parseResult.error.format() },
      { status: 422 },
    );
  }

  const payload: CreateAdminResponsibilityFormInput = parseResult.data;

  // Use injected adminDb (tests) or imported adminDb for runtime
  const adminDb = injectedAdminDb;

  // If admin DB not initialized, return a stub token so the UI can progress in local/dev mode
  if (!adminDb) {
    const token = "stub-form-token";
    const tokenExpiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
    return NextResponse.json({ ok: true, token, tokenExpiresAt, isStub: true }, { status: 200 });
  }

  try {
    // url-safe random token
    const token = randomBytes(12).toString("base64url");

    const docRef = adminDb.collection("compliance_forms").doc(token);

    const nowIso = new Date().toISOString();
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days TTL for onboarding form token

    await docRef.set({
      ...payload,
      createdAt: nowIso,
      status: "submitted",
      token,
      // v14 draft metadata used by create-network-* handlers
      expiresAt,
      immutable: false,
      attachedTo: null,
    });

    return NextResponse.json({ ok: true, token, tokenExpiresAt: expiresAt }, { status: 200 });
  } catch (err) {
    console.error("admin-form persist failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// Keep Next.js route export for runtime; wrap the testable handler so Next.js
// doesn't pass the route `context` object as the second argument (which would
// be mistaken for an injected Firestore instance). The wrapper matches the
// expected Next.js signature: (req, ctx) => Response
// Route adapter + security wrapper
async function apiRoute(req: NextRequest) {
  return await adminFormHandler(req as any);
}

export const POST = withRequestLogging(withSecurity(apiRoute as any, { requireAuth: true }));
