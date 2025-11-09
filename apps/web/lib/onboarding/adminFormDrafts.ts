// [P0][FIREBASE][CODE] AdminFormDrafts
// Tags: P0, FIREBASE, CODE
import { db } from "@/lib/firebaseAdmin";
import {
  CreateAdminResponsibilityFormSchema,
  type AdminResponsibilityForm,
  type CreateAdminResponsibilityFormInput,
} from "@fresh-schedules/types";
import { z } from "zod";

const AdminFormDraftDocSchema = z.object({
  userId: z.string(),
  createdAt: z.date(),
  expiresAt: z.date(),
  status: z.enum(["active", "consumed", "expired"]),
  form: CreateAdminResponsibilityFormSchema,
  taxValidation: z.object({
    isValid: z.boolean(),
    reason: z.string().optional(),
    checkedAt: z.date().optional(),
  }),
});

export type AdminFormDraftDoc = z.infer<typeof AdminFormDraftDocSchema>;

/**
 * Creates a pre-network admin responsibility form draft and returns a token
 * that can be used later by /api/onboarding/create-network-*
 */
export async function createAdminFormDraft(params: {
  userId: string;
  form: CreateAdminResponsibilityFormInput;
  taxValidation: {
    isValid: boolean;
    reason?: string;
  };
  ttlMinutes?: number;
}): Promise<{ formToken: string }> {
  const { userId, form, taxValidation, ttlMinutes = 60 } = params;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);

  const draft: AdminFormDraftDoc = {
    userId,
    createdAt: now,
    expiresAt,
    status: "active",
    form,
    taxValidation: {
      isValid: taxValidation.isValid,
      reason: taxValidation.reason,
      checkedAt: now,
    },
  };

  const ref = db.collection("adminFormDrafts").doc();
  await ref.set(draft);

  return { formToken: ref.id };
}

/**
 * Peek a draft without consuming it (for debugging or re-checks).
 */
export async function getAdminFormDraft(formToken: string) {
  const snap = await db.collection("adminFormDrafts").doc(formToken).get();
  if (!snap.exists) return null;

  const raw = snap.data();
  if (!raw) return null;

  const parsed = AdminFormDraftDocSchema.safeParse(raw);
  if (!parsed.success) {
    console.error("Invalid adminFormDraft document", parsed.error.format());
    return null;
  }

  const draft = parsed.data;
  if (draft.status !== "active") return null;
  if (draft.expiresAt.getTime() < Date.now()) return null;

  return { id: snap.id, ...draft };
}

/**
 * Atomically consume a draft. Returns the stored form or null if
 * token is invalid/expired/already used.
 */
export async function consumeAdminFormDraft(params: {
  formToken: string;
  expectedUserId?: string;
}): Promise<{
  form: AdminResponsibilityForm;
  taxValidation: { isValid: boolean; reason?: string };
} | null> {
  const { formToken, expectedUserId } = params;

  const ref = db.collection("adminFormDrafts").doc(formToken);

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return null;

    const raw = snap.data();
    if (!raw) return null;

    const parsed = AdminFormDraftDocSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Invalid adminFormDraft in consume", parsed.error.format());
      return null;
    }

    const draft = parsed.data;

    // Hard constraints
    if (draft.status !== "active") return null;
    if (draft.expiresAt.getTime() < Date.now()) return null;
    if (expectedUserId && draft.userId !== expectedUserId) return null;

    // Mark as consumed, but keep record for audit
    tx.update(ref, {
      status: "consumed",
      consumedAt: new Date(),
    });

    return {
      form: draft.form as AdminResponsibilityForm,
      taxValidation: {
        isValid: draft.taxValidation.isValid,
        reason: draft.taxValidation.reason,
      },
    };
  });
}
