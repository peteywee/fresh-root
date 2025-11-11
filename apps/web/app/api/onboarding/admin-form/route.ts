//[P1][API][ONBOARDING] Admin Form Endpoint (server)
// Tags: api, onboarding, admin-form, compliance

import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

/**
 * Inner handler exported for tests. Accepts an optional injected adminDb for testability.
 */
export async function adminFormHandler(
  req: NextRequest & { user?: { uid: string } },
  injectedAdminDb = importedAdminDb,
) {
  let body: unknown;

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
    const formToken = "stub-form-token";
    return NextResponse.json({ ok: true, formToken }, { status: 200 });
  }

  try {
    // url-safe random token
    const token = randomBytes(12).toString("base64url");

    const formsRoot = adminDb
      .collection("compliance")
      .doc("adminResponsibilityForms")
      .collection("forms");
    const docRef = formsRoot.doc(token);

    const nowIso = new Date().toISOString();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 60 minutes TTL for onboarding form token

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

    return NextResponse.json({ ok: true, formToken: token }, { status: 200 });
  } catch (err) {
    console.error("admin-form persist failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// Keep Next.js route export for runtime; wrap the testable handler so Next.js
// doesn't pass the route `context` object as the second argument (which would
// be mistaken for an injected Firestore instance). The wrapper matches the
// expected Next.js signature: (req, ctx) => Response
export const POST = async (req: NextRequest, _ctx: { params?: any }) => {
  return await adminFormHandler(req as NextRequest & { user?: { uid: string } });
};
