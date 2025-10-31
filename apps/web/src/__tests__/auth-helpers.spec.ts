import * as firebaseAuth from 'firebase/auth';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as helpers from '../lib/auth-helpers';

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<any>('firebase/auth');
  return {
    ...actual,
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn(),
    signInWithRedirect: vi.fn(),
    isSignInWithEmailLink: vi.fn(),
    sendSignInLinkToEmail: vi.fn(),
    signInWithEmailLink: vi.fn(),
    getRedirectResult: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
  (global as any).window = { location: { href: 'http://localhost/auth/callback', origin: 'http://localhost' }, localStorage: new Map() };
  (window.localStorage as any).getItem = (k: string) => (window.localStorage as any).get(k);
  (window.localStorage as any).setItem = (k: string, v: string) => (window.localStorage as any).set(k, v);
  (window.localStorage as any).removeItem = (k: string) => (window.localStorage as any).delete(k);
});

describe('Google popup -> redirect fallback', () => {
  it('falls back to redirect on popup error', async () => {
    (firebaseAuth.signInWithPopup as any).mockRejectedValue(new Error('popup blocked'));
    (firebaseAuth.signInWithRedirect as any).mockResolvedValue(undefined);
    await expect(helpers.loginWithGooglePopupOrRedirect()).resolves.toBeUndefined();
    expect(firebaseAuth.signInWithRedirect).toHaveBeenCalled();
  });
});

describe('Email link completion', () => {
  it('prompts for email if not stored and link present', async () => {
    (firebaseAuth.isSignInWithEmailLink as any).mockReturnValue(true);
    (firebaseAuth.signInWithEmailLink as any).mockResolvedValue({});
    vi.spyOn(window, 'prompt').mockReturnValue('user@test.com');
    await expect(helpers.completeEmailLinkIfPresent()).resolves.toBe(true);
  });
});

describe('Google redirect completion idempotent', () => {
  it('swallows duplicate getRedirectResult calls', async () => {
    (firebaseAuth.getRedirectResult as any).mockResolvedValueOnce({ user: { uid: '1' } }).mockResolvedValueOnce(null);
    const first = await helpers.completeGoogleRedirectOnce();
    const second = await helpers.completeGoogleRedirectOnce();
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
