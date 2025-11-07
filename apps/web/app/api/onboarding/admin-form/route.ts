import { NextRequest, NextResponse } from "next/server";
import { AdminFormSubmissionSchema, AdminFormSubmissionInput } from "@fresh-schedules/types"; // adjust alias if needed

// TODO: wire to your real storage (Redis, Firestore temp collection, etc.)
async function saveAdminFormDraft(
  uid: string,
  payload: AdminFormSubmissionInput,
  meta: { ipAddress: string; userAgent: string },
): Promise<string> {
  // This function should:
  // - generate a random token/id
  // - store { uid, payload, meta, createdAt } somewhere
  // - return token
  // For now, we just stub it.
  return "stub-form-token";
}

// TODO: replace with real auth/session retrieval.
async function getSessionUser(req: NextRequest): Promise<{
  uid: string;
  email: string;
} | null> {
  // Example:
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) return null;
  // return { uid: session.user.id, email: session.user.email! };
  return {
    uid: "stub-user-id",
    email: "stub@example.com",
  };
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser(req);

  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json", message: "Request body must be valid JSON" },
      { status: 400 },
    );
  }

  const parsed = AdminFormSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_error",
        issues: parsed.error.format(),
      },
      { status: 422 },
    );
  }

  const payload: AdminFormSubmissionInput = parsed.data;

  // Basic extra sanity check: force liabilityAcknowledged to be true.
  if (!payload.liabilityAcknowledged) {
    return NextResponse.json(
      {
        error: "liability_not_acknowledged",
        message: "You must acknowledge responsibility for the workspace to proceed.",
      },
      { status: 400 },
    );
  }

  const ipAddress = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";
  const userAgent = req.headers.get("user-agent") ?? "unknown";

  const formToken = await saveAdminFormDraft(user.uid, payload, {
    ipAddress,
    userAgent,
  });

  return NextResponse.json(
    {
      ok: true,
      formToken,
    },
    { status: 200 },
  );
}
