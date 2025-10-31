"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type AuthState = {
  user: any | null;
  isLoading: boolean;
};

// ...you can replace the placeholder implementation with your real auth logic...
const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // If provider is missing, return a safe default.
    return { user: null, isLoading: false };
  }
  return ctx;
}
