// [P1][API][CODE] Batch API endpoint
// Tags: P1, API, CODE, BATCH

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import { CreateBatchSchema } from "@fresh-schedules/types";
import { createBatchHandler } from "@fresh-schedules/api-framework";
import { NextResponse } from "next/server";
import { ok, badRequest, serverError } from "../_shared/validation";

/*
 * POST /api/batch
 * Processes a list of items as a single batch operation.
 * Demonstrates SDK factory + batch handler usage with canonical Zod validation.
 */
export const POST = createOrgEndpoint({
  auth: "optional",
  org: "optional",
  input: CreateBatchSchema,
  handler: async ({ input, context, request }) => {
    try {
      const handler = createBatchHandler({
        maxBatchSize: 200, // sensible default
        timeoutPerItem: 5000,
        continueOnError: input.continueOnError ?? true,
        itemHandler: async ({ item, index }) => {
          // Example item handler: echo payload
          return { id: (item as any).id, processedAt: Date.now() } as unknown;
        },
      });

      const result = await handler(input.items, context, request as Request);
      return ok(result);
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
