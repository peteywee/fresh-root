// [P0][AUTH][CODE] Auth Context
// Tags: P0, AUTH, CODE
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
  user: Record<string, unknown> | null;
  isLoading: boolean;
};

// ...you can replace the placeholder implementation with your real auth logic...
const AuthContext = createContext<AuthState | undefined>(undefined);

/**
 * Provides the authentication context to its children.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The rendered authentication provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Placeholder: replace with real initialization (fetch session, etc.)
    const init = async () => {
      // simulate async auth check
      setTimeout(() => {
        setUser(null);
        setIsLoading(false);
      }, 10);
    };
    void init();
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

/**
 * A custom hook to access the authentication context.
 *
 * @returns {AuthState} The current authentication state, including the user and loading status.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // If provider is missing, return a safe default.
    return { user: null, isLoading: false };
  }
  return ctx;
}
