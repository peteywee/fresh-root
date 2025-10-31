import * as firebaseAuth from 'firebase/auth';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import * as helpers from '../lib/auth-helpers';

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual<typeof import('firebase/auth')>('firebase/auth');
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
  const mockStorage = new Map<string, string>();
  // Create a mock localStorage that implements Storage interface
  const mockLocalStorage = {
    getItem: (k: string) => mockStorage.get(k) ?? null,
    setItem: (k: string, v: string) => mockStorage.set(k, v),
    removeItem: (k: string) => mockStorage.delete(k),
    clear: () => mockStorage.clear(),
    key: (index: number) => Array.from(mockStorage.keys())[index] ?? null,
    get length() { return mockStorage.size; },
  };
  
  global.window = { 
    location: { href: 'http://localhost/auth/callback', origin: 'http://localhost' } as Location, 
    localStorage: mockLocalStorage as Storage,
    prompt: vi.fn(),
  } as unknown as Window & typeof globalThis;
});

describe('Google popup -> redirect fallback', () => {
  it('falls back to redirect on popup error', async () => {
    vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue(new Error('popup blocked'));
    vi.mocked(firebaseAuth.signInWithRedirect).mockResolvedValue(undefined);
    await expect(helpers.loginWithGooglePopupOrRedirect()).resolves.toBeUndefined();
    expect(firebaseAuth.signInWithRedirect).toHaveBeenCalled();
  });
});

describe('Email link completion', () => {
  it('prompts for email if not stored and link present', async () => {
    vi.mocked(firebaseAuth.isSignInWithEmailLink).mockReturnValue(true);
    vi.mocked(firebaseAuth.signInWithEmailLink).mockResolvedValue({} as never);
    vi.spyOn(window, 'prompt').mockReturnValue('user@test.com');
    await expect(helpers.completeEmailLinkIfPresent()).resolves.toBe(true);
  });
});

describe('Google redirect completion idempotent', () => {
  it('swallows duplicate getRedirectResult calls', async () => {
    vi.mocked(firebaseAuth.getRedirectResult)
      .mockResolvedValueOnce({ user: { uid: '1' } } as never)
      .mockResolvedValueOnce(null);
    const first = await helpers.completeGoogleRedirectOnce();
    const second = await helpers.completeGoogleRedirectOnce();
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
