// [P0][FIREBASE][CODE] AdminFormDrafts
// Tags: P0, FIREBASE, CODE
import { getFirebaseAdminDb } from "@/lib/firebase-admin";
import {
  getDocWithType,
  setDocWithType,
  updateDocWithType,
  transactionWithType,
} from "@/src/lib/firebase/typed-wrappers";
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

  const db = getFirebaseAdminDb();
  const ref = db.collection("adminFormDrafts").doc(crypto.randomUUID());

  await setDocWithType<AdminFormDraftDoc>(db, ref, draft);

  return { formToken: ref.id };
}

/**
 * Peek a draft without consuming it (for debugging or re-checks).
 */
export async function getAdminFormDraft(formToken: string) {
  const db = getFirebaseAdminDb();
  const ref = db.collection("adminFormDrafts").doc(formToken);

  const draft = await getDocWithType<AdminFormDraftDoc>(db, ref);
  if (!draft) return null;

  if (draft.status !== "active") return null;
  if (draft.expiresAt.getTime() < Date.now()) return null;

  return { id: formToken, ...draft };
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
  const db = getFirebaseAdminDb();
  const ref = db.collection("adminFormDrafts").doc(formToken);

  return await transactionWithType<{
    form: AdminResponsibilityForm;
    taxValidation: { isValid: boolean; reason?: string };
  } | null>(db, async (tx) => {
    const draft = await tx.get(ref);
    if (!draft.exists) return null;

    const raw = draft.data();
    if (!raw) return null;

    const parsed = AdminFormDraftDocSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Invalid adminFormDraft in consume", parsed.error.format());
      return null;
    }

    const data = parsed.data;

    // Hard constraints
    if (data.status !== "active") return null;
    if (data.expiresAt.getTime() < Date.now()) return null;
    if (expectedUserId && data.userId !== expectedUserId) return null;

    // Mark as consumed, but keep record for audit
    tx.update(ref, {
      status: "consumed",
      consumedAt: new Date(),
    });

    return {
      form: data.form as AdminResponsibilityForm,
      taxValidation: {
        isValid: data.taxValidation.isValid,
        reason: data.taxValidation.reason,
      },
    };
  });
}
