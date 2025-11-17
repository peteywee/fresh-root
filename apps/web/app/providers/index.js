// [P0][APP][CODE] Index
// Tags: P0, APP, CODE
"use client";
import { jsx as _jsx } from "react/jsx-runtime";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./queryClient";
import "../lib/firebaseClient";
import { AuthProvider } from "../lib/auth-context";
export default function Providers({ children }) {
    const client = getQueryClient();
    return (_jsx(QueryClientProvider, { client: client, children: _jsx(AuthProvider, { children: children }) }));
}
