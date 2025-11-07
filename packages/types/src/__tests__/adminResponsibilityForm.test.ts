// [P1][INTEGRITY][TEST] AdminResponsibilityForm schema tests
// Tags: P1, INTEGRITY, TEST, ZOD, COMPLIANCE
import { Timestamp } from 'firebase-admin/firestore';
import { describe, it, expect } from 'vitest';

import { AdminResponsibilityFormSchema } from '../compliance/adminResponsibilityForm';

describe('AdminResponsibilityFormSchema', () => {
  it('validates a full form', () => {
    const now = Timestamp.now();
    const obj = {
      formId: 'f1',
      networkId: 'n1',
      uid: 'u1',
      role: 'network_owner',
      status: 'submitted',
      certification: {
        acknowledgesDataProtection: true,
        acknowledgesGDPRCompliance: true,
        acknowledgesAccessControl: true,
        acknowledgesMFARequirement: true,
        acknowledgesAuditTrail: true,
        acknowledgesIncidentReporting: true,
        understandsRoleScope: true,
        agreesToTerms: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = AdminResponsibilityFormSchema.safeParse(obj);
    expect(result.success).toBe(true);
  });

  it('requires certification booleans to be true', () => {
    const now = Timestamp.now();
    const obj = {
      formId: 'f2',
      networkId: 'n1',
      uid: 'u1',
      role: 'network_admin',
      certification: {
        acknowledgesDataProtection: true,
        acknowledgesGDPRCompliance: false, // invalid
        acknowledgesAccessControl: true,
        acknowledgesMFARequirement: true,
        acknowledgesAuditTrail: true,
        acknowledgesIncidentReporting: true,
        understandsRoleScope: true,
        agreesToTerms: true,
      },
      createdAt: now,
      updatedAt: now,
    };

    const result = AdminResponsibilityFormSchema.safeParse(obj);
    expect(result.success).toBe(false);
  });
});
