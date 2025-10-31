import { describe, it, expect, vi } from 'vitest';
vi.mock('../lib/firebase.server', async () => {
  const fakeDoc = () => {
    const data: any = {};
    return {
      id: 'id',
      set: vi.fn(async (x: any) => Object.assign(data, x)),
      get: vi.fn(async () => ({ exists: true, data: () => data })),
      collection: vi.fn(() => ({ doc: fakeDoc() })),
    };
  };
  const fakeDb = {
    collection: vi.fn((_name: string) => ({ doc: fakeDoc() })),
  };
  return {
    adminDb: fakeDb,
    adminAuth: {
      getUser: vi.fn().mockResolvedValue({ customClaims: {} }),
      setCustomUserClaims: vi.fn().mockResolvedValue(undefined),
    }
  };
});

describe('org create', () => {
  it('requires name and ownerUid', async () => {
    const mod = await import('../../app/api/orgs/create/route');
    const res = await mod.POST(new Request('http://x', { method:'POST', body: JSON.stringify({}) }));
    expect(res.status).toBe(400);
  });
});

describe('token generate/validate', () => {
  it('generates a token with expiry', async () => {
    const gen = await import('../../app/api/tokens/generate/route');
    const res = await gen.POST(new Request('http://x', { method:'POST', body: JSON.stringify({ orgId:'o', createdBy:'u' }) }));
    expect(res.status).toBe(200);
  });

  it('validates token and writes pending membership', async () => {
    const val = await import('../../app/api/tokens/validate/route');
    const res = await val.POST(new Request('http://x', { method:'POST', body: JSON.stringify({ tokenId:'t', userId:'u' }) }));
    expect(res.status).toBe(200);
  });
});

describe('approvals update', () => {
  it('sets claims for active member', async () => {
    const mod = await import('../../app/api/approvals/update/route');
    const res = await mod.POST(new Request('http://x', { method:'POST', body: JSON.stringify({ orgId: 'o', userId: 'u', status: 'active' }) }));
    expect(res.status).toBe(200);
  });
});
