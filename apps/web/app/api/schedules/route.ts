// [P0][SCHEDULE][API] Schedules list endpoint (with improved type definitions)

import { CreateScheduleSchema } from "@fresh-schedules/types";
import { z } from "zod";
type CreateScheduleInput = z.infer<typeof CreateScheduleSchema>;
import { Timestamp } from "firebase-admin/firestore";
import { createOrgEndpoint } from "@fresh-schedules/api-framework";
import type { NextRequest } from "next/server";

import { ok, serverError } from "../_shared/validation";

import { adminDb } from "@/src/lib/firebase.server";
import type { RequestContext } from "@fresh-schedules/api-framework";
import { setDocWithType, queryWithType } from "@/lib/firebase/typed-wrappers";

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
  const pagination = (() => {
    const { searchParams } = new URL(request.url);
    return {
      limit: parsePositiveInt(searchParams.get("limit"), 20),
      offset: parsePositiveInt(searchParams.get("offset"), 0),
    };
  })();
  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    const schedulesCollection = db.collection(
      `organizations/${context.org!.orgId}/schedules`,
    );

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
const createSchedule = async (input: CreateScheduleInput, context: RequestContext) => {
  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    const { name, startDate, endDate } = input;
    const scheduleRef = db.collection(`orgs/${context.org!.orgId}/schedules`).doc();
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
    console.error("Failed to create schedule", {
      error: message,
      orgId: context.org?.orgId,
      userId: context.auth?.userId
    });
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
    return listSchedules(request as unknown as Request, context);
  }
});

/**
 * POST /api/schedules
 * Create a new schedule (requires scheduler+ role)
 */
export const POST = createOrgEndpoint({
  roles: ['scheduler'],
  rateLimit: { maxRequests: 50, windowMs: 60_000 },
  input: CreateScheduleSchema,
  handler: async ({ input, context }) => {
    return createSchedule(input, context);
  }
});
