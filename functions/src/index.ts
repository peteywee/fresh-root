// [P2][APP][CODE] Index
// Tags: P2, APP, CODE
/* =============================================================================
 * functions/src/index.ts
 *
 * Cloud Functions v2 entrypoint for Fresh Schedules.
 *
 * NOTE:
 * - If you already had exports in your previous index.ts,
 *   paste them into the "EXISTING EXPORTS" region below.
 * - This file only wires functions that are implemented in:
 *     - ./joinOrganization.ts
 *     - ./triggers/denormalization.ts
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/* Existing exports (if any)                                                  */
/* -------------------------------------------------------------------------- */

/**
 * If your previous functions/src/index.ts exported other functions,
 * paste those exports here. Example:
 *
 * export { assignCustomClaims } from './auth/assignCustomClaims';
 * export { replicateAttendanceToLedger } from './attendance/replicateAttendanceToLedger';
 *
 * Leave this section empty if you had no prior exports or if you intend
 * to only deploy the new join + denormalization functions.
 */

// TODO: PASTE YOUR EXISTING EXPORTS ABOVE THIS LINE (IF YOU HAVE ANY).

/* -------------------------------------------------------------------------- */
/* Atomic Join Flow (Critical Fix for C1)                                     */
/* -------------------------------------------------------------------------- */

/**
 * joinOrganization
 *
 * Implements the atomic org-join flow with:
 * - Auth + Firestore transaction boundaries
 * - Compensating transaction (delete Auth user if DB write fails)
 * - Idempotency via join token
 *
 * Source: functions/src/joinOrganization.ts
 */
export { joinOrganization } from "./joinOrganization";

/* -------------------------------------------------------------------------- */
/* Denormalization Triggers (Critical Fix for C6 - N+1 Queries)               */
/* -------------------------------------------------------------------------- */

/**
 * onZoneWrite
 * - Triggered when a zone document changes.
 * - Updates venue.cachedZones to avoid N+1 zone lookups.
 *
 * onMembershipWrite
 * - Triggered when org member docs are created/updated/deleted.
 * - Updates org.memberCount and related denormalized fields.
 *
 * onUserProfileUpdate
 * - Triggered when /users/{userId} changes.
 * - Propagates relevant fields to all membership docs for that user.
 *
 * onScheduleUpdate
 * - Triggered when schedules are created/updated.
 * - Keeps any denormalized schedule summary fields in sync.
 *
 * reconcileOrgStats
 * - Scheduled function (e.g., daily) that recalculates org stats
 *   as a safety net to correct any drift.
 *
 * Source: functions/src/triggers/denormalization.ts
 */
export {
  onMembershipWrite,
  onScheduleUpdate,
  onUserProfileUpdate,
  onZoneWrite,
  reconcileOrgStats,
} from "./triggers/denormalization";
