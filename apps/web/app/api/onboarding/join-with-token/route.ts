//[P1][API][ONBOARDING] Join with token
// Tags: api, onboarding, join

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const token = (body as any)?.token;
  if (!token) {
    return NextResponse.json({ error: "missing_token" }, { status: 422 });
  }

  // TODO: Validate token, resolve network/org/venue and create membership
  // For now return a stubbed success response
  return NextResponse.json(
    {
      ok: true,
      networkId: "stub-network-id",
      orgId: "stub-org-id",
      venueId: "stub-venue-id",
      role: "staff",
      message: "Joined (stub response). Replace with real token resolution.",
    },
    { status: 200 },
  );
}
