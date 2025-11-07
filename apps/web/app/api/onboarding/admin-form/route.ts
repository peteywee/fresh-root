//[P1][API][ONBOARDING] Admin Form Endpoint
// Tags: api, onboarding, admin-form, compliance

import {
  CreateAdminResponsibilityFormSchema,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { NextRequest, NextResponse } from "next/server";

/**
 * Accepts the Admin Responsibility Form payload from the onboarding wizard.
 * Backend will later attach networkId/adminUid/etc when creating the Network.
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 4.3 (Admin Responsibility Form)
 */
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const payload: CreateAdminResponsibilityFormInput = parseResult.data;

  // TODO: perform basic tax id pattern validation here if desired.

  // TODO: persist this temporarily (session, temp collection, etc.).
  // For now just return a stub token.

  const formToken = "stub-form-token"; // replace with real token/id.

  return NextResponse.json(
    {
      ok: true,
      formToken,
    },
    { status: 200 },
  );
}
