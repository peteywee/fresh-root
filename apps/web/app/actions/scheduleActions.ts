// [P0][APP][CODE] ScheduleActions
// Tags: P0, APP, CODE
"use server";

import { invalidate } from "../lib/cache";
// import your admin/write path here (HTTP endpoint or function)

const TAG_SCHEDULES = (orgId: string) => `schedules:${orgId}`;

export function publishSchedule({
  orgId,
}: {
  orgId: string;
  scheduleId: string;
}) {
  // TODO: perform the privileged write (e.g., call Cloud Function or route handler)
  // await callPublish(orgId, scheduleId);

  // Invalidate tag so lists/detail revalidate on next request
  invalidate(TAG_SCHEDULES(orgId));
}
