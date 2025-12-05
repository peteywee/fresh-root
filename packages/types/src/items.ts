// [P1][ITEMS][SCHEMA] Items API schemas
import { z } from "zod";

export const CreateItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.coerce.number().int().nonnegative().optional().default(0),
  unit: z.string().optional(),
  isActive: z.boolean().optional().default(true),
});
export type CreateItemInput = z.infer<typeof CreateItemSchema>;

export const UpdateItemSchema = CreateItemSchema.partial();
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
