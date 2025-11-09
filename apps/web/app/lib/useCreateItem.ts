// [P2][APP][CODE] UseCreateItem
// Tags: P2, APP, CODE
"use client";
import { useMutation } from "@tanstack/react-query";

import { apiFetch } from "./http";

type Item = { id: string; name: string; createdAt: number };
type CreateItemInput = { name: string };

/**
 * A custom hook for creating a new item using a mutation.
 * It uses `@tanstack/react-query`'s `useMutation` to handle the API request,
 * caching, and error handling.
 *
 * @returns {import("@tanstack/react-query").UseMutationResult<Item, unknown, CreateItemInput, unknown>} The result of the mutation.
 */
export function useCreateItem() {
  return useMutation({
    mutationFn: async (payload: CreateItemInput) => {
      const data = await apiFetch<Item>("/api/items", {
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
