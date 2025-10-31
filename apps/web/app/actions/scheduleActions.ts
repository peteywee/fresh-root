"use server";

import { invalidate } from "../lib/cache";
// import your admin/write path here (HTTP endpoint or function)

const TAG_SCHEDULES = (orgId: string) => `schedules:${orgId}`;

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
