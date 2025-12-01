// [P0][ONBOARDING][API] Admin responsibility form endpoint
import { CreateAdminResponsibilityFormSchema, type CreateAdminResponsibilityFormInput } from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";

import { adminDb as importedAdminDb } from "@/src/lib/firebase.server";

export const GET = createAuthenticatedEndpoint({
  input: CreateAdminResponsibilityFormSchema.optional(),
  handler: async ({ request }) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    const parseResult = CreateAdminResponsibilityFormSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "validation_error", issues: parseResult.error.format() }, { status: 422 });
    }
    const payload: CreateAdminResponsibilityFormInput = parseResult.data;
    const adminDb = importedAdminDb;
    const token = randomBytes(16).toString("hex");
    if (!adminDb) {
      console.log("Admin DB not initialized; returning stub token");
      return NextResponse.json({ ok: true, formToken: token }, { status: 200 });
    }
    try {
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
  },
});
