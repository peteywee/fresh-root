// [P0][ONBOARDING][API] Admin responsibility form endpoint
import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { withSecurity } from "../../_shared/middleware";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

/**
 * Inner handler logic (not exported)
 */
async function adminFormHandlerImpl(
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
  const token = randomBytes(16).toString("hex");

  if (!adminDb) {
    console.log("Admin DB not initialized; returning stub token");
    return NextResponse.json({ ok: true, formToken: token }, { status: 200 });
  }

  try {
    // Save form submission to Firestore
    const formsRef = adminDb.collection("admin_responsibility_forms");
    const docRef = await formsRef.add({
      ...payload,
      submittedAt: new Date(),
      formToken: token,
      status: "pending_review",
    });

    console.log(`Admin responsibility form created: ${docRef.id}`);
    return NextResponse.json({ ok: true, formToken: token }, { status: 200 });
  } catch (err) {
    console.error("admin-form persist failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// Wrap with security
export const GET = withSecurity(async (req: NextRequest) => {
  return await adminFormHandlerImpl(req as NextRequest & { user?: { uid: string } });
});
