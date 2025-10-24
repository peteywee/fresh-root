import { z } from "zod";
import { parseJson, badRequest, ok, serverError } from "../_shared/validation";

/**
 * A simple example endpoint to demonstrate:
 * - Zod validation
 * - Standard error shape
 * - Returning JSON
 */
const CreateItemInput = z.object({
  name: z.string().min(1, "name is required"),
});

export async function POST(req: Request) {
  try {
    const parsed = await parseJson(req, CreateItemInput);
    if (!parsed.success) {
      return badRequest("Validation failed", parsed.details);
    }
    const { name } = parsed.data;

    // Normally you'd write to Firestore here. We'll simulate a created item.
    const item = { id: crypto.randomUUID(), name, createdAt: Date.now() };
    return ok(item);
  } catch (e: any) {
    return serverError(e?.message ?? "Unexpected error");
  }
}

// Optional: GET returns a static list (safe demo)
export async function GET() {
  return ok([{ id: "demo-1", name: "Sample", createdAt: 0 }]);
}
