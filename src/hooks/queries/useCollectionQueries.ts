'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi, Collection } from '@/api/collections';

/**
 * Aligned with backend cacheRoute("collections", 120) and cacheRoute("collections", 300)
 */
export const COLLECTION_KEYS = {
  all: ['collections'] as const,
  lists: () => [...COLLECTION_KEYS.all, 'list'] as const,
  list: (params?: { status?: string; featured?: boolean }) =>
    [...COLLECTION_KEYS.lists(), params] as const,
  details: () => [...COLLECTION_KEYS.all, 'detail'] as const,
  detail: (slug: string) => [...COLLECTION_KEYS.details(), slug] as const,
};

/**
 * Hook for collections listing
 * Backend TTL: 120 seconds
 */
export function useCollectionsQuery(params?: { status?: string; featured?: boolean }) {
  return useQuery({
    queryKey: COLLECTION_KEYS.list(params),
    queryFn: async () => {
      const res = await collectionsApi.list(params);
      return res.data;
    },
    staleTime: 120 * 1000, // 2 minutes (matches backend Redis TTL)
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Mutation: Create Collection
 * Mirrors backend delPattern("collections:")
 */
export function useCreateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string; status?: string; featured?: boolean }) =>
      collectionsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.all });
    },
  });
}

/**
 * Mutation: Update Collection
 * Mirrors backend delPattern("collections:")
 */
export function useUpdateCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; description: string; status: string; featured: boolean }> }) =>
      collectionsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.all });
    },
  });
}

/**
 * Mutation: Delete Collection
 * Mirrors backend delPattern("collections:")
 */
export function useDeleteCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => collectionsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: COLLECTION_KEYS.all });
    },
  });
}
