// [P1][INTEGRITY][VALIDATION] Validation
// Tags: P1, INTEGRITY, VALIDATION
import { NextResponse } from "next/server";
import { z } from "zod";

/** Standard API error payload shape */
export type ApiError = {
  error: { code: string; message: string; details?: unknown };
};

/** Build a 400 error response with consistent shape */
export function badRequest(message: string, details?: unknown, code = "BAD_REQUEST") {
  return NextResponse.json({ error: { code, message, details } } as ApiError, { status: 400 });
}

/** Build a 500 error response with consistent shape */
export function serverError(
  message = "Internal Server Error",
  details?: unknown,
  code = "INTERNAL",
) {
  return NextResponse.json({ error: { code, message, details } } as ApiError, { status: 500 });
}

/** Build a 200 response */
export function ok<T>(data: T) {
  return NextResponse.json(data, { status: 200 });
}

/** Utility to parse JSON request bodies against a Zod schema */
export async function parseJson<T>(req: Request, schema: z.ZodType<T>) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw new Error("Invalid JSON");
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    const details = parsed.error.issues.map((i) => ({
      path: i.path.join("."),
      message: i.message,
    }));
    return { success: false as const, details };
  }
  return { success: true as const, data: parsed.data };
}

export const OrganizationCreateSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100),
  description: z.string().max(500).optional(),
  settings: z.record(z.unknown()).optional(),
});
