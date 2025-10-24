'use client';
import { useMutation } from '@tanstack/react-query';
import { apiFetch } from './http';

type Item = { id: string; name: string; createdAt: number };
type CreateItemInput = { name: string };

export function useCreateItem() {
  return useMutation({
    mutationFn: async (payload: CreateItemInput) => {
      const data = await apiFetch<Item>('/api/items', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return data;
    },
    onError(err) {
      // eslint-disable-next-line no-console
      console.error('CreateItem failed:', err);
    },
  });
}
