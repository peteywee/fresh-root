// [P1][API][SCHEDULES] Schedules API route handler
// Tags: P1, API, SCHEDULES, validation, zod

import { CreateScheduleSchema } from "@fresh-schedules/types";
import { Timestamp } from "firebase-admin/firestore";
import { NextRequest } from "next/server";

import { requireOrgMembership, requireRole } from "../../../src/lib/api";
import { withSecurity } from "../_shared/middleware";
import { badRequest, ok, parseJson, serverError } from "../_shared/validation";

import { adminDb } from "@/src/lib/firebase.server";

type Role = "org_owner" | "admin" | "manager" | "scheduler" | "corporate" | "staff";

type SchedulesContext = {
  params: Record<string, string>;
  userId: string;
  orgId: string;
};

type SchedulesMutationContext = SchedulesContext & { roles: Role[] };

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

const listSchedules = async (request: NextRequest, context: SchedulesContext) => {
  const pagination = getPagination(request);
  const { db, error } = getAdminDbOrError();
  if (error) {
    return error;
  }

  try {
    const snapshot = await db
      .collection(`organizations/${context.orgId}/schedules`)
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

const createSchedule = async (request: NextRequest, context: SchedulesMutationContext) => {
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
    const scheduleRef = db.collection(`organizations/${context.orgId}/schedules`).doc();
    const now = Timestamp.now();

    const schedule = {
      id: scheduleRef.id,
      name,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: Timestamp.fromDate(new Date(endDate)),
      state: "draft",
      createdAt: now,
      updatedAt: now,
      createdBy: context.userId,
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
export const GET = withSecurity(
  requireOrgMembership((request: NextRequest, context: SchedulesContext) =>
    listSchedules(request, context),
  ),
  LIST_SECURITY_OPTIONS,
);

/**
 * POST /api/schedules
 * Create a new schedule (requires scheduler+ role)
 */
export const POST = withSecurity(
  requireOrgMembership(
    requireRole("scheduler")((request: NextRequest, context: SchedulesMutationContext) =>
      createSchedule(request, context),
    ),
  ),
  MUTATION_SECURITY_OPTIONS,
);
