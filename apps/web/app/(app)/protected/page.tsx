"use client";

import React from "react";

import ProtectedRoute from "../../components/ProtectedRoute";
import { useCreateItem } from "../../lib/useCreateItem";

export default function ProtectedDemoPage() {
  const createItem = useCreateItem();

  return (
    <ProtectedRoute>
      <main className="space-y-4 p-6">
        <h1 className="text-2xl font-semibold">Protected Demo</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = form.elements.namedItem("name") as HTMLInputElement;
            const name = input.value.trim();
            if (name) createItem.mutate({ name });
            input.value = "";
          }}
        >
          <input
            name="name"
            placeholder="New item name"
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded border bg-black px-3 py-2 text-sm text-white"
            disabled={createItem.isPending}
          >
            {createItem.isPending ? "Creating…" : "Create"}
          </button>
        </form>
        {createItem.isError && (
          <div className="text-sm text-red-700">
            {createItem.error instanceof Error ? createItem.error.message : "Error"}
          </div>
        )}
        {createItem.isSuccess && (
          <pre className="rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(createItem.data, null, 2)}
          </pre>
        )}
      </main>
    </ProtectedRoute>
  );
}
