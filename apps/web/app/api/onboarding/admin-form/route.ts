//[P1][API][ONBOARDING] Admin Form Endpoint (server)
// Tags: api, onboarding, admin-form, compliance

import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { adminDb } from "@/src/lib/firebase.server";
import { parseJson, badRequest, ok, serverError } from "../../_shared/validation";

export async function POST(req: NextRequest) {
  const parseResult = await parseJson(req, CreateAdminResponsibilityFormSchema);
  
  if (!parseResult.success) {
    return badRequest("Validation failed", parseResult.details, "VALIDATION_ERROR");
  }

  const payload: CreateAdminResponsibilityFormInput = parseResult.data;

  // If admin DB not initialized, return a stub token so the UI can progress in local/dev mode
  if (!adminDb) {
    const formToken = "stub-form-token";
    return ok({ ok: true, formToken });
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

    return ok({ ok: true, formToken: token });
  } catch (err) {
    console.error("admin-form persist failed", err);
    return serverError("Failed to persist admin form");
  }
}
