"use server";

type CreatePayload = { orgId: string; startDate: number };

/**
 * Server action that calls the API (keeps secrets server-side).
 * In dev, we pass x-user-token (JSON) to simulate Firebase custom claims.
 * In prod, swap to a signed session/token and add a gateway in the API to decode it.
 */
export async function createSchedule(payload: CreatePayload) {
  const token = {
    uid: "u1-dev",
    orgId: payload.orgId,
    roles: ["manager"]
  };
  const res = await fetch(`${process.env.API_BASE_URL ?? "http://localhost:4000"}/orgs/${payload.orgId}/schedules`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-user-token": JSON.stringify(token)
    },
    body: JSON.stringify({ startDate: payload.startDate }),
    cache: "no-store"
  });
  if (!res.ok) {
      let errorPayload: any = { error: "unknown" };
      try {
        errorPayload = await res.json();
      } catch {
        errorPayload = { error: await res.text() };
      }
      throw new Error(`API error ${res.status}: ${errorPayload.error ?? "unknown"}`);
    }
  return res.json();
}
