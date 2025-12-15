// [P0][API][CODE] Batch API endpoint
// Tags: P1, API, CODE, BATCH

import { z } from "zod";
import { createOrgEndpoint, createBatchHandler } from "@fresh-schedules/api-framework";

import { badRequest, serverError } from "../_shared/validation";

// TODO: Move to packages/types/src/batch.ts once module resolution stabilizes
// For now, inline to avoid TypeScript import resolution issues in monorepo
const CreateBatchSchema = z.object({
  items: z.array(
    z.object({
      id: z.string().min(1),
      payload: z.unknown(),
    }),
  ),
  continueOnError: z.boolean().optional(),
});

/*
 * POST /api/batch
 * Processes a list of items as a single batch operation.
 * Demonstrates SDK factory + batch handler usage with canonical Zod validation.
 */
export async function processBatchItems(
  items: unknown[],
  context: any,
  request: Request,
  options?: { maxBatchSize?: number; timeoutPerItem?: number; continueOnError?: boolean },
) {
  const handler = createBatchHandler({
    maxBatchSize: options?.maxBatchSize ?? 200,
    timeoutPerItem: options?.timeoutPerItem ?? 5000,
    continueOnError: options?.continueOnError ?? true,
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

export const POST = createOrgEndpoint({
  roles: ["manager"],
  rateLimit: { maxRequests: 40, windowMs: 60_000 },
  csrf: false,
  input: CreateBatchSchema,
  handler: async ({ input, context, request }) => {
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
