// [P1][INTEGRITY][TEST] Networks schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, NETWORKS
import { Timestamp } from 'firebase-admin/firestore';
import { describe, it, expect } from 'vitest';

import { NetworkSchema } from '../networks';

describe('NetworkSchema', () => {
  it('validates a complete network object', () => {
    const now = Timestamp.now();
    const network = {
      id: 'n1',
      slug: 'acme-corp',
      displayName: 'Acme Corp',
      legalName: 'Acme Corporation',
      kind: 'corporate_network',
      segment: 'retail',
      status: 'pending_verification',
      environment: 'production',
      primaryRegion: 'US',
      timeZone: 'America/Chicago',
      currency: 'USD',
      plan: 'free',
      billingMode: 'none',
      maxVenues: null,
      maxActiveOrgs: null,
      maxActiveUsers: null,
      maxShiftsPerDay: null,
      requireMfaForAdmins: true,
      ipAllowlistEnabled: false,
      features: {},
      ownerUserId: 'user_1',
      createdAt: now,
      createdBy: 'user_1',
      updatedAt: now,
    };

    const result = NetworkSchema.safeParse(network);
    expect(result.success).toBe(true);
  });

  it('fails when required fields are missing', () => {
    const result = NetworkSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('id');
      expect(paths).toContain('slug');
      expect(paths).toContain('displayName');
      expect(paths).toContain('kind');
      expect(paths).toContain('segment');
      expect(paths).toContain('status');
    }
  });
});
