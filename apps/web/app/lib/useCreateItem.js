// [P2][APP][CODE] UseCreateItem
// Tags: P2, APP, CODE
"use client";
import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "./http";
export function useCreateItem() {
    return useMutation({
        mutationFn: async (payload) => {
            const data = await apiFetch("/api/items", {
                method: "POST",
                body: JSON.stringify(payload),
            });
            return data;
        },
        onError(err) {
            console.error("CreateItem failed:", err);
        },
    });
}
