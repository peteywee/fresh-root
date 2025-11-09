// [P0][APP][CODE] CreateSchedule
// Tags: P0, APP, CODE
"use server";

type CreatePayload = { orgId: string; startDate: number };

/**
 * A server action that creates a new schedule by calling the API.
 * This function keeps secrets on the server-side and should not be exposed to the client.
 *
 * @param {CreatePayload} payload - The data for creating the schedule.
 * @param {string} payload.orgId - The ID of the organization.
 * @param {number} payload.startDate - The start date of the schedule.
 * @returns {Promise<any>} A promise that resolves with the response from the API.
 * @throws {Error} If the `orgId` has an invalid format or if the API call fails.
 */
export async function createSchedule(payload: CreatePayload) {
  // Validate orgId to prevent SSRF (allow only alphanumeric, hyphen, underscore)
  if (!/^[a-zA-Z0-9_-]+$/.test(payload.orgId)) {
    throw new Error("Invalid orgId format");
  }
  const token = {
    uid: "u1-dev",
    orgId: payload.orgId,
    roles: ["manager"],
  };
  const res = await fetch(
    `${process.env.API_BASE_URL ?? "http://localhost:4000"}/orgs/${payload.orgId}/schedules`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-user-token": JSON.stringify(token),
      },
      body: JSON.stringify({ startDate: payload.startDate }),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    let errorPayload: { error: string } = { error: "unknown" };
    try {
      errorPayload = await res.json();
    } catch {
      errorPayload = { error: await res.text() };
    }
    throw new Error(`API error ${res.status}: ${errorPayload.error ?? "unknown"}`);
  }
  return res.json();
}
