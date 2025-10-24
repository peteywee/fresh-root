'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useCreateItem } from '../../lib/useCreateItem';

export default function ProtectedDemoPage() {
  const createItem = useCreateItem();

  return (
    <ProtectedRoute>
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Protected Demo</h1>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget as HTMLFormElement;
            const input = (form.elements.namedItem('name') as HTMLInputElement);
            const name = input.value.trim();
            if (name) createItem.mutate({ name });
            input.value = '';
          }}
        >
          <input
            name="name"
            placeholder="New item name"
            className="border rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded px-3 py-2 text-sm border bg-black text-white"
            disabled={createItem.isPending}
          >
            {createItem.isPending ? 'Creating…' : 'Create'}
          </button>
        </form>
        {createItem.isError && (
          <div className="text-sm text-red-700">
            {(createItem.error as any)?.message ?? 'Error'}
          </div>
        )}
        {createItem.isSuccess && (
          <pre className="text-xs bg-gray-100 p-3 rounded">
            {JSON.stringify(createItem.data, null, 2)}
          </pre>
        )}
      </main>
    </ProtectedRoute>
  );
}
