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
  
  // Mock indexedDB for pendingEmail.store
  const mockIDB = {
    open: vi.fn().mockResolvedValue({
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue(undefined),
          put: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
        }),
      }),
    }),
  };
  (global as unknown as { indexedDB: typeof mockIDB }).indexedDB = mockIDB;
  
  type MockStorage = Map<string, string> & {
    getItem: (k: string) => string | undefined;
    setItem: (k: string, v: string) => void;
    removeItem: (k: string) => void;
  };
  
  const mockLocalStorage = new Map() as MockStorage;
  mockLocalStorage.getItem = (k: string) => mockLocalStorage.get(k);
  mockLocalStorage.setItem = (k: string, v: string) => mockLocalStorage.set(k, v);
  mockLocalStorage.removeItem = (k: string) => mockLocalStorage.delete(k);
  
  (global as unknown as { window: { location: Location; localStorage: MockStorage; prompt: typeof vi.fn } }).window = { 
    location: { href: 'http://localhost/auth/callback', origin: 'http://localhost' } as Location, 
    localStorage: mockLocalStorage,
    prompt: vi.fn(),
  };
});

describe('Google popup -> redirect fallback', () => {
  it('falls back to redirect on popup error', async () => {
    vi.mocked(firebaseAuth.signInWithPopup).mockRejectedValue(new Error('popup blocked'));
    vi.mocked(firebaseAuth.signInWithRedirect).mockResolvedValue(undefined as never);
    await expect(helpers.loginWithGoogleSmart()).resolves.toBeUndefined();
    expect(firebaseAuth.signInWithRedirect).toHaveBeenCalled();
  });
});

describe('Email link completion', () => {
  it('prompts for email if not stored and link present', async () => {
    vi.mocked(firebaseAuth.isSignInWithEmailLink).mockReturnValue(true);
    vi.mocked(firebaseAuth.signInWithEmailLink).mockResolvedValue({} as firebaseAuth.UserCredential);
    vi.spyOn(window, 'prompt').mockReturnValue('user@test.com');
    await expect(helpers.completeEmailLinkIfPresent()).resolves.toBe(true);
  });
});

describe('Google redirect completion idempotent', () => {
  it('swallows duplicate getRedirectResult calls', async () => {
    vi.mocked(firebaseAuth.getRedirectResult).mockResolvedValueOnce({ user: { uid: '1' } } as firebaseAuth.UserCredential).mockResolvedValueOnce(null);
    const first = await helpers.completeGoogleRedirectOnce();
    const second = await helpers.completeGoogleRedirectOnce();
    expect(first).toBe(true);
    expect(second).toBe(false);
  });
});
