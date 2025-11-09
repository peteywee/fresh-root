// [P0][APP][CODE] ScheduleActions
// Tags: P0, APP, CODE
"use server";

import { invalidate } from "../lib/cache";
// import your admin/write path here (HTTP endpoint or function)

/**
 * @fileoverview This file contains server actions for managing schedules.
 */
const TAG_SCHEDULES = (orgId: string) => `schedules:${orgId}`;

/**
 * A server action that publishes a schedule.
 *
 * @param {object} params - The parameters for the action.
 * @param {string} params.orgId - The ID of the organization.
 * @param {string} params.scheduleId - The ID of the schedule to publish.
 */
export async function publishSchedule({
  orgId,
  scheduleId: _scheduleId,
}: {
  orgId: string;
  scheduleId: string;
}) {
  // TODO: perform the privileged write (e.g., call Cloud Function or route handler)
  // await callPublish(orgId, scheduleId);

  // Invalidate tag so lists/detail revalidate on next request
  invalidate(TAG_SCHEDULES(orgId));
}
