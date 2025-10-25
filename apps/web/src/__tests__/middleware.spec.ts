import { describe, it, expect } from 'vitest';
import { middleware } from '../middleware';
import { NextRequest } from 'next/server';

function req(path: string, cookie?: string) {
  return new NextRequest(`http://localhost${path}`, {
    headers: cookie ? { cookie } as any : undefined,
  });
}

describe('middleware', () => {
  it('exempts /auth/callback', () => {
    const res = middleware(req('/auth/callback'));
    expect(res).toBeTruthy(); // NextResponse.next()
  });

  it('blocks /dashboard without __session', () => {
    const res = middleware(req('/dashboard'));
    expect(res.headers.get('location')).toMatch('/login');
  });

  it('redirects /login to /dashboard if __session present', () => {
    const res = middleware(req('/login', '__session=x'));
    expect(res.headers.get('location')).toMatch('/dashboard');
  });
});
