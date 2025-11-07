//[P1][API][ONBOARDING] Create Network + Corporate Endpoint
// Tags: api, onboarding, network, corporate

import { NextRequest, NextResponse } from 'next/server';

/**
 * Creates a Network and Corporate node for a corporate-centric onboarding flow.
 *
 * Workflow:
 * 1. Verify eligibility (auth, email, role)
 * 2. Resolve AdminResponsibilityForm via formToken
 * 3. Create Network (kind="corporate_network")
 * 4. Create Corporate doc + memberships
 *
 * @see docs/bible/Project_Bible_v14.0.0.md Section 4.4 (Create Network + Corporate Flow)
 *
 * Skeleton only. Fill in with admin SDK + Zod validation.
 */
export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // Expected fields: corporateName, brandName, ownsLocations, worksWithFranchisees, approxLocations, formToken.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _body = body; // Placeholder for future Zod validation

  // TODO:
  // - verify eligibility
  // - resolve AdminResponsibilityForm via formToken
  // - create Network (kind="corporate_network")
  // - create Corporate doc + memberships

  return NextResponse.json(
    {
      ok: true,
      networkId: 'stub-network-id',
      corpId: 'stub-corp-id',
      status: 'pending_verification',
    },
    { status: 200 }
  );
}
