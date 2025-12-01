// [P0][SCHEDULE][API] Schedules list endpoint

import { CreateScheduleSchema } from "@fresh-schedules/types";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest } from "next/server";
import { createAuthenticatedEndpoint, createOrgEndpoint } from "@fresh-schedules/api-framework";

import { badRequest, ok, parseJson, serverError } from "../_shared/validation";

import { adminDb } from "@/src/lib/firebase.server";
import { RequestContext } from "@fresh-schedules/api-framework";

const LIST_SECURITY_OPTIONS = { requireAuth: true, maxRequests: 100, windowMs: 60_000 } as const;
const MUTATION_SECURITY_OPTIONS = { requireAuth: true, maxRequests: 50, windowMs: 60_000 } as const;

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getPagination = (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  return {
    limit: parsePositiveInt(searchParams.get("limit"), 20),
    offset: parsePositiveInt(searchParams.get("offset"), 0),
  };
};

const getAdminDbOrError = () => {
  if (!adminDb) {
    return { error: serverError("Admin DB not initialized") } as const;
  }
  return { db: adminDb } as const;
};

const listSchedules = async (request: NextRequest, context: RequestContext) => {
  const pagination = getPagination(request);
  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    const snapshot = await db
      .collection(`organizations/${context.org!.orgId}/schedules`)
      .orderBy("createdAt", "desc")
      .limit(pagination.limit)
      .offset(pagination.offset)
      .get();

    const schedules = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return ok({ data: schedules, ...pagination });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return serverError(message);
  }
};

const createSchedule = async (request: NextRequest, context: RequestContext) => {
  const parsed = await parseJson(request, CreateScheduleSchema);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.details);
  }

  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    const { name, startDate, endDate } = parsed.data;
    const scheduleRef = db.collection(`organizations/${context.org!.orgId}/schedules`).doc();
    const now = Timestamp.now();

    const schedule = {
      id: scheduleRef.id,
      name,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      state: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: context.auth!.userId,
    };

    await scheduleRef.set(schedule);

    return ok({ success: true, schedule });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return serverError(message);
  }
};

/**
 * GET /api/schedules
 * List schedules for an organization
 */
export const GET = createOrgEndpoint({
  rateLimit: { maxRequests: 100, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    return listSchedules(request, context);
  }
});

/**
 * POST /api/schedules
 * Create a new schedule (requires scheduler+ role)
 */
export const POST = createOrgEndpoint({
  roles: ['scheduler'],
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ request, context }) => {
    return createSchedule(request, context);
  }
});
