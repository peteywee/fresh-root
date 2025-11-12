// [P0][OBSERVABILITY][LOGGING] EventLog
// Tags: P0, OBSERVABILITY, LOGGING
/**
 * [P1][PLATFORM][EVENTS] Event logging helper (server)
 * Tags: platform, events, audit, analytics
 *
 * Overview:
 * - Provides a single function to append events to the Firestore event log
 * - Used by onboarding + network APIs for auditability and analytics
 * - Uses the v14 EventSchema from @fresh-schedules/types
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { NewEventSchema, type NewEvent } from "@fresh-schedules/types";
import type { Firestore } from "firebase-admin/firestore";

export async function logEvent(adminDb: Firestore | any, input: NewEvent): Promise<void> {
  if (!adminDb) {
    // In local/stub mode, just console.log instead of writing to Firestore.
    // This keeps the call sites simple and prevents crashes when adminDb is undefined.
    console.log("[eventLog] stub event:", input);
    return;
  }

  const parsed = NewEventSchema.safeParse(input);
  if (!parsed.success) {
    // If the event doesn't match our schema, fail FAST in dev.
    // In production, you might want to send this to an error tracker instead.
    console.error("[eventLog] schema validation failed:", parsed.error);
    console.error("[eventLog] invalid event payload", parsed.error.flatten());
    return;
  }

  const event = parsed.data;
  const eventsCollection = adminDb.collection("events");
  const docRef = eventsCollection.doc();

  await docRef.set({
    id: docRef.id,
    ...event,
  });
}
