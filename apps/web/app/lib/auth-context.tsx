// [P0][AUTH][CODE] Auth Context
// Tags: P0, AUTH, CODE
"use client";
import { User, onAuthStateChanged } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";

import { auth } from "./firebaseClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

/**
 * Provides the authentication context to its children, making the authenticated user's state available throughout the app.
 *
 * @param {object} props - The props for the component.
 * @param {React.ReactNode} props.children - The child components to be wrapped by the provider.
 * @returns {JSX.Element} The rendered authentication provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{ user, isLoading }}>{children}</AuthContext.Provider>;
}

/**
 * A custom hook to access the authentication context, which includes the user and loading state.
 *
 * @returns {AuthContextType} The current authentication context.
 */
export function useAuth() {
  return useContext(AuthContext);
}
