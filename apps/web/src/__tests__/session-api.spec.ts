import { describe, it, expect, vi } from 'vitest';

// Mock Admin Auth
vi.mock('../lib/firebase.server', async () => {
  return {
    adminAuth: {
      createSessionCookie: vi.fn().mockResolvedValue('cookie'),
      verifySessionCookie: vi.fn().mockResolvedValue({ sub: 'uid' }),
      revokeRefreshTokens: vi.fn().mockResolvedValue(undefined),
    },
  };
});

describe('/api/session', () => {
  it('rejects missing idToken', async () => {
    const mod = await import('../../app/api/session/route');
    const res = await mod.POST(new Request('http://test', { method: 'POST', body: JSON.stringify({}) }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/Missing idToken/);
  });
});
