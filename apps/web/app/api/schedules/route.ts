// [P0][SCHEDULE][API] Schedules list endpoint (with improved type definitions)

import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import type { RequestContext } from "@fresh-schedules/api-framework";
import { CreateScheduleSchema } from "@fresh-schedules/types";
import type { CreateScheduleInput } from "@fresh-schedules/types";
import { Timestamp } from "firebase-admin/firestore";

import { badRequest, ok, parseJson, serverError } from "../_shared/validation";

import { setDocWithType, queryWithType } from "@/src/lib/firebase/typed-wrappers";
import { adminDb } from "@/src/lib/firebase.server";

const parsePositiveInt = (value: string | null, fallback: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
};

const getPagination = (request: Request) => {
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

/**
 * Schedule document type for Firestore
 */
export interface ScheduleDoc {
  id: string;
  orgId: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  state: "draft" | "published" | "archived";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
  publishedAt?: Timestamp;
  [key: string]: unknown;
}

/**
 * Shift document type for Firestore
 */
export interface ShiftDoc {
  id: string;
  userId: string;
  role: string;
  startTs: string;
  endTs: string;
  createdAt: Timestamp;
}

/**
 * List schedules for an organization with pagination and type safety
 */
const listSchedules = async (request: Request, context: RequestContext) => {
  const pagination = getPagination(request);
  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    const schedulesCollection = db.collection(`organizations/${context.org!.orgId}/schedules`);

    // Use typed query for better type safety
    const result = await queryWithType<ScheduleDoc>(
      db,
      schedulesCollection
        .orderBy("createdAt", "desc")
        .limit(pagination.limit)
        .offset(pagination.offset),
    );

    if (!result.success) {
      return serverError("Failed to fetch schedules");
    }

    return ok({ data: result.data, ...pagination });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return serverError(message);
  }
};

/**
 * Create a new schedule with full type safety
 */
const createSchedule = async (request: Request, context: RequestContext) => {
  const parsed = await parseJson(request, CreateScheduleSchema);
  if (!parsed.success) {
    return badRequest("Invalid payload", parsed.details);
  }

  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    // parsed may not be fully narrowed by TypeScript across module boundaries; assert shape
    const successParsed = parsed as { success: true; data: CreateScheduleInput };
    const { name, startDate, endDate } = successParsed.data;
    const scheduleRef = db.collection(`organizations/${context.org!.orgId}/schedules`).doc();
    const now = Timestamp.now();

    const schedule: ScheduleDoc = {
      id: scheduleRef.id,
      orgId: String(context.org!.orgId),
      name: String(name),
      startDate: Timestamp.fromDate(new Date(Number(startDate))),
      endDate: Timestamp.fromDate(new Date(Number(endDate))),
      state: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: String(context.auth!.userId),
    };

    await setDocWithType<ScheduleDoc>(db, scheduleRef, schedule);

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
  handler: async ({ request, input: _input, context, params: _params }) => {
    return listSchedules(request, context);
  },
});

/**
 * POST /api/schedules
 * Create a new schedule (requires scheduler+ role)
 */
export const POST = createOrgEndpoint({
  roles: ["scheduler"],
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  handler: async ({ request, input: _input, context, params: _params }) => {
    return createSchedule(request, context);
  },
});
