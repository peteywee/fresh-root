// [P2][DOMAIN][SCHEMA] Batch schema
// Tags: P2, DOMAIN, SCHEMA
import { z } from "zod";

export const BatchItemSchema = z.object({
  id: z.string().min(1),
  payload: z.unknown(),
});

export type BatchItem = z.infer<typeof BatchItemSchema>;

export const CreateBatchSchema = z.object({
  items: z.array(BatchItemSchema),
  continueOnError: z.boolean().optional(),
});

export type CreateBatch = z.infer<typeof CreateBatchSchema>;
