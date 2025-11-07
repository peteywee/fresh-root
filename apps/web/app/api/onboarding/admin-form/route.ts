//[P1][API][ONBOARDING] Admin Form Endpoint (server)
// Tags: api, onboarding, admin-form, compliance

import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/src/lib/firebase.server";


export async function POST(req: NextRequest) {
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

    await docRef.set({
      ...payload,
      createdAt: new Date().toISOString(),
      status: "submitted",
      token,
    });

    return NextResponse.json({ ok: true, formToken: token }, { status: 200 });
  } catch (err) {
    console.error("admin-form persist failed", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
