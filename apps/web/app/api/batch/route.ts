// [P0][BATCH][API] Batch API endpoint
// Tags: P0, BATCH, API, CODE

import { z } from "zod";
import {
  createOrgEndpoint,
  createBatchHandler,
  type RequestContext,
} from "@fresh-schedules/api-framework";

import { badRequest, serverError } from "../_shared/validation";

// Batch item schema - validates each item in the batch
const BatchItemSchema = z.object({
  id: z.string().min(1),
  payload: z
    .object({
      fail: z.boolean().optional(),
      delay: z.number().optional(),
    })
    .passthrough()
    .optional()
    .default({}),
});

type BatchItem = z.infer<typeof BatchItemSchema>;

const CreateBatchSchema = z.object({
  items: z.array(BatchItemSchema),
  continueOnError: z.boolean().optional(),
});

/*
 * Processes a list of items as a single batch operation.
 * Demonstrates SDK factory + batch handler usage with canonical Zod validation.
 */
async function processBatchItems(
  items: BatchItem[],
  context: RequestContext,
  // NOTE: Using Request type to avoid Next.js version mismatch between packages
  // (apps/web uses next@16.1.0, api-framework uses next@16.0.10)
  // TODO: Align Next.js versions across monorepo packages
  request: Request,
  options?: { maxBatchSize?: number; timeoutPerItem?: number; continueOnError?: boolean },
) {
  const handler = createBatchHandler<BatchItem, { id: string; processedAt: number }>({
    maxBatchSize: options?.maxBatchSize ?? 200,
    timeoutPerItem: options?.timeoutPerItem ?? 5000,
    continueOnError: options?.continueOnError ?? true,
    itemHandler: async ({ item }) => {
      // Test helpers: support failure and delay flags in payload for test cases
      const payload = item.payload ?? {};
      if (payload.fail) {
        throw new Error("Item failed intentionally");
      }
      if (typeof payload.delay === "number" && payload.delay > 0) {
        await new Promise((r) => setTimeout(r, payload.delay));
      }
      return { id: item.id, processedAt: Date.now() };
    },
  });

  // Type assertion required due to Next.js version mismatch between packages
  return handler(items, context, request as any);
}

export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 40, windowMs: 60_000 },
  csrf: false,
  input: CreateBatchSchema,
  handler: async ({ request, input, context, params: _params }) => {
    try {
      // Type assertion safe - input validated by createEndpoint
      const typedInput = input as z.infer<typeof CreateBatchSchema>;
      // Ensure items is present and an array
      if (!typedInput || !Array.isArray(typedInput.items)) {
        return badRequest("Invalid payload: items must be an array");
      }
      const result = await processBatchItems(typedInput.items, context, request);
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
