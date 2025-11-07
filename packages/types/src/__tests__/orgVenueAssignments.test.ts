// [P1][INTEGRITY][TEST] OrgVenueAssignment schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, LINKS
import { Timestamp } from 'firebase-admin/firestore';
import { describe, it, expect } from 'vitest';

import { OrgVenueAssignmentSchema } from '../links/orgVenueAssignments';

describe('OrgVenueAssignmentSchema', () => {
  it('validates a complete assignment', () => {
    const now = Timestamp.now();
    const a = {
      assignmentId: 'a1',
      networkId: 'n1',
      orgId: 'o1',
      venueId: 'v1',
      role: 'tenant',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: 'user1',
      updatedBy: 'user1',
    };

    const result = OrgVenueAssignmentSchema.safeParse(a);
    expect(result.success).toBe(true);
  });

  it('requires required fields', () => {
    const result = OrgVenueAssignmentSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('assignmentId');
      expect(paths).toContain('networkId');
      expect(paths).toContain('orgId');
      expect(paths).toContain('venueId');
    }
  });
});
