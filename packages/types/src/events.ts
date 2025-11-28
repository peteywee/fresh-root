// [P1][TYPES][SCHEMA] Schema definitions
// Tags: P2, APP, CODE
/**
 * [P1][PLATFORM][EVENTS] Core event types for Fresh Schedules v14
 * Tags: platform, events, audit, analytics
 *
 * Overview:
 * - Defines the canonical shape of events emitted by backend APIs
 * - Used for audit logs, analytics, and as a future AI data source
 * - Events are append-only; treat them as an immutable log
 */

import { z } from "zod";

// High-level event categories (useful for filtering)
export const EventCategory = z.enum([
  "onboarding",
  "network",
  "org",
  "venue",
  "membership",
  "compliance",
  "system",
]);

export type EventCategory = z.infer<typeof EventCategory>;

// Concrete event types for v14 (start small; grow over time)
export const EventType = z.enum([
  "network.created",
  "network.activated",
  "org.created",
  "venue.created",
  "membership.created",
  "membership.updated",
  "onboarding.completed",
]);

export type EventType = z.infer<typeof EventType>;

// Minimal event payload schema. Keep this flexible.
export const EventPayloadSchema = z.record(z.string(), z.unknown());

export type EventPayload = z.infer<typeof EventPayloadSchema>;

// Canonical event document schema
export const EventSchema = z.object({
  id: z.string(), // Firestore doc id
  at: z.number().int().positive(), // timestamp (ms since epoch)
  category: EventCategory,
  type: EventType,

  // Optional actor and scope
  actorUserId: z.string().optional(),
  networkId: z.string().optional(),
  orgId: z.string().optional(),
  venueId: z.string().optional(),

  // Arbitrary payload, validated at the edge
  payload: EventPayloadSchema,
});

export type Event = z.infer<typeof EventSchema>;

// Input for creating a new event before assigning id
export const NewEventSchema = EventSchema.omit({ id: true });

export type NewEvent = z.infer<typeof NewEventSchema>;
