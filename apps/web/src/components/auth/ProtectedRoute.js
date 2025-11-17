// [P0][AUTH][CODE] ProtectedRoute
// Tags: P0, AUTH, CODE
"use client";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useAuth } from "../../lib/auth-context";
export default function ProtectedRoute({ children }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!isLoading && !user)
            router.replace("/login");
    }, [isLoading, user, router]);
    if (isLoading || !user)
        return React.createElement("div", { className: "p-6" }, "Loading…");
    return React.createElement(React.Fragment, null, children);
}
