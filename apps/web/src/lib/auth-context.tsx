// [P1][AUTH][CODE] Auth Context - Wired to Firebase onAuthStateChanged
// Tags: P1, AUTH, CODE, FIREBASE
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../../app/lib/firebaseClient";
import { FLAGS } from "./features";

type AuthState = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If REAL_AUTH feature flag is disabled, use placeholder behavior
    if (!FLAGS.REAL_AUTH) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Guard: if auth is not initialized (no Firebase config), fallback gracefully
    if (!auth) {
      console.warn("Firebase auth not initialized - check NEXT_PUBLIC_FIREBASE_* environment variables");
      setIsLoading(false);
      return;
    }

    // Wire to Firebase onAuthStateChanged
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      },
      (error) => {
        console.error("Firebase auth state change error:", error);
        setUser(null);
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // If provider is missing, return a safe default.
    return { user: null, isLoading: false };
  }
  return ctx;
}
