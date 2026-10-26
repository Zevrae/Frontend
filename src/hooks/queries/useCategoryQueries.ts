'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, Category } from '@/api/categories';

/**
 * Aligned with backend cacheRoute("categories", 120) and cacheRoute("categories", 300)
 */
export const CATEGORY_KEYS = {
  all: ['categories'] as const,
  lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
  list: (params?: { status?: string; parent?: string | null }) =>
    [...CATEGORY_KEYS.lists(), params] as const,
  details: () => [...CATEGORY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...CATEGORY_KEYS.details(), id] as const,
};

/**
 * Hook for categories listing
 * Backend TTL: 120 seconds
 */
export function useCategoriesQuery(params?: { status?: string; parent?: string | null }) {
  return useQuery({
    queryKey: CATEGORY_KEYS.list(params),
    queryFn: async () => {
      const res = await categoriesApi.list(params);
      return res.data;
    },
    staleTime: 120 * 1000, // 2 minutes (matches backend Redis TTL)
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * Hook for single category by ID
 * Backend TTL: 300 seconds
 */
export function useCategoryDetailsQuery(id: string) {
  return useQuery({
    queryKey: CATEGORY_KEYS.detail(id),
    queryFn: async () => {
      if (!id) return null;
      return await categoriesApi.getById(id);
    },
    enabled: !!id,
    staleTime: 300 * 1000, // 5 minutes (matches backend Redis TTL)
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * Mutation: Create Category
 * Mirrors backend delPattern("categories:")
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; description?: string; parent?: string | null; status?: string }) =>
      categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}

/**
 * Mutation: Update Category
 * Mirrors backend delPattern("categories:")
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<{ name: string; description: string; parent: string | null; status: string }> }) =>
      categoriesApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.detail(variables.id) });
    },
  });
}

/**
 * Mutation: Delete Category
 * Mirrors backend delPattern("categories:")
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
  });
}
