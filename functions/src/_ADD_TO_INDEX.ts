// [P2][APP][CODE]  ADD TO INDEX
// Tags: P2, APP, CODE
/**
 * ADD THESE EXPORTS TO YOUR EXISTING functions/src/index.ts
 *
 * Don't replace your file - just add these lines.
 */

// =============================================================================
// ADD: Atomic Join Flow (Critical Fix for C1)
// =============================================================================
export { joinOrganization } from "./joinOrganization";

// =============================================================================
// ADD: Denormalization Triggers (Critical Fix for C6 - N+1 Queries)
// =============================================================================
export {
  onZoneWrite,
  onMembershipWrite,
  onUserProfileUpdate,
  onScheduleUpdate,
  reconcileOrgStats,
} from "./triggers/denormalization";
