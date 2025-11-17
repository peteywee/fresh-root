// [P1][API][CODE] ProtectedRoute
// Tags: P1, API, CODE
"use client";
import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../lib/auth-context";
export default function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !user)
            router.replace("/login");
    }, [isLoading, user, router]);
    if (isLoading)
        return _jsx("div", { className: "p-6", children: "Loading\u2026" });
    if (!user)
        return null;
    return _jsx(_Fragment, { children: children });
}
