// [P0][AUTH][CODE] Auth Context
// Tags: P0, AUTH, CODE
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from "react";
// ...you can replace the placeholder implementation with your real auth logic...
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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
    return _jsx(AuthContext.Provider, { value: { user, isLoading }, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        // If provider is missing, return a safe default.
        return { user: null, isLoading: false };
    }
    return ctx;
}
