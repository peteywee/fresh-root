// [P1][API][CODE] Batch API endpoint
// Tags: P1, API, CODE, BATCH

import { createAuthenticatedEndpoint } from "@fresh-schedules/api-framework";
import { CreateBatchSchema } from "@fresh-schedules/types";
import { createBatchHandler } from "@fresh-schedules/api-framework";
import { badRequest, serverError } from "../_shared/validation";

/*
 * POST /api/batch
 * Processes a list of items as a single batch operation.
 * Demonstrates SDK factory + batch handler usage with canonical Zod validation.
 */
export async function processBatchItems(
  items: unknown[],
  context: any,
  request: Request,
) {
  const handler = createBatchHandler({
    maxBatchSize: 200,
    timeoutPerItem: 5000,
    continueOnError: true,
    itemHandler: async ({ item, index }) => {
      // Test helpers: support failure and delay flags in payload for test cases
      const payload = (item as any).payload || {};
      if (payload.fail) {
        throw new Error("Item failed intentionally");
      }
      if (typeof payload.delay === "number" && payload.delay > 0) {
        await new Promise((r) => setTimeout(r, payload.delay));
      }
      return { id: (item as any).id, processedAt: Date.now() } as unknown;
    },
  });

  return handler(items, context, request as any);
}

export const POST = createAuthenticatedEndpoint({
  rateLimit: { maxRequests: 40, windowMs: 60_000 },
  auth: "required",
  org: "optional",
  csrf: false,
  input: CreateBatchSchema,
  handler: async ({ input, context, request }) => {
    try {
      // Ensure items is present and an array
      if (!input || !Array.isArray((input as any).items)) {
        return badRequest("Invalid payload: items must be an array");
      }
      const result = await processBatchItems((input as any).items, context, request);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      console.error("Batch processing failed", { error: message, orgId: context.org?.orgId });
      // specific message for batch size errors
      if (err instanceof Error && err.message.includes("exceeds maximum")) {
        return badRequest(err.message);
      }
      return serverError("Failed to process batch");
    }
  },
});
