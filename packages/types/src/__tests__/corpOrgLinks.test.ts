// [P1][INTEGRITY][TEST] CorpOrgLink schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, LINKS
import { Timestamp } from 'firebase-admin/firestore';
import { describe, it, expect } from 'vitest';

import { CorpOrgLinkSchema } from '../links/corpOrgLinks';

describe('CorpOrgLinkSchema', () => {
  it('validates a complete corp-org link', () => {
    const now = Timestamp.now();
    const link = {
      linkId: 'l1',
      networkId: 'n1',
      corporateId: 'c1',
      orgId: 'o1',
      relationType: 'owns',
      status: 'active',
      createdAt: now,
      updatedAt: now,
      createdBy: 'user1',
      updatedBy: 'user1',
    };

    const result = CorpOrgLinkSchema.safeParse(link);
    expect(result.success).toBe(true);
  });

  it('requires required fields', () => {
    const result = CorpOrgLinkSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'));
      expect(paths).toContain('linkId');
      expect(paths).toContain('networkId');
      expect(paths).toContain('corporateId');
      expect(paths).toContain('orgId');
    }
  });
});
