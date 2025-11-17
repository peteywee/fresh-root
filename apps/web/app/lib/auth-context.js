// [P0][AUTH][CODE] Auth Context
// Tags: P0, AUTH, CODE
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { onAuthStateChanged } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "./firebaseClient";
const AuthContext = createContext({
    user: null,
    isLoading: true,
});
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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
    return _jsx(AuthContext.Provider, { value: { user, isLoading }, children: children });
}
export function useAuth() {
    return useContext(AuthContext);
}
