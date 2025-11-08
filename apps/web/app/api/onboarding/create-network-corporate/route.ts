//[P1][API][ONBOARDING] Create Network + Corporate Endpoint
// Tags: api, onboarding, network, corporate

import { CreateCorporateOnboardingSchema } from "@fresh-schedules/types";
import { NextResponse } from "next/server";

import { withSecurity, type AuthenticatedRequest } from "../../_shared/middleware";

import { adminDb } from "@/src/lib/firebase.server";

/**
 * Minimal Create Network + Corporate Endpoint (protected)
 * - verifies auth via middleware
 * - validates body with Zod
 * - if adminDb present, creates network + corporate doc in a transaction
 * - otherwise returns stub ids for local/dev
 */
export const POST = withSecurity(
  async (req: AuthenticatedRequest) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid_json" }, { status: 400 });
    }

    const parsed = CreateCorporateOnboardingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", details: parsed.error.flatten() },
        { status: 422 },
      );
    }

    const { corporateName, brandName, formToken } = parsed.data;

    // Local/dev fallback
    if (!adminDb) {
      return NextResponse.json(
        {
          ok: true,
          networkId: "stub-network-id",
          corpId: "stub-corp-id",
          status: "pending_verification",
        },
        { status: 200 },
      );
    }

    const adb = adminDb;

    const uid = req.user?.uid;
    if (!uid) return NextResponse.json({ error: "not_authenticated" }, { status: 401 });

    try {
      const networkRef = adb.collection("networks").doc();
      const corpRef = adb.collection("corporates").doc();

      await adb.runTransaction(async (tx) => {
        tx.set(networkRef, {
          name: corporateName || `Network ${new Date().toISOString()}`,
          kind: "corporate_network",
          status: "pending_verification",
          createdAt: Date.now(),
        });

        tx.set(corpRef, {
          name: corporateName || brandName || "Corporate",
          networkId: networkRef.id,
          createdAt: Date.now(),
        });

        if (formToken) {
          const formRef = adb
            .collection("compliance")
            .doc("adminResponsibilityForms")
            .collection("forms")
            .doc(String(formToken));
          tx.update(formRef, {
            attachedTo: { networkId: networkRef.id, corpId: corpRef.id },
            immutable: true,
            status: "attached",
            attachedAt: Date.now(),
          });
        }
      });

      return NextResponse.json(
        { ok: true, networkId: networkRef.id, corpId: corpRef.id, status: "pending_verification" },
        { status: 200 },
      );
    } catch (err) {
      console.error("create-network-corporate failed", err);
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  },
  { requireAuth: true },
);
