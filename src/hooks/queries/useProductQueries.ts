'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, ProductListParams, Product } from '@/api/products';

/**
 * Aligned with backend cacheRoute("products", 120) and cacheRoute("products", 300)
 */
export const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (params?: ProductListParams) => [...PRODUCT_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
};

/**
 * Hook for product catalog listing
 * Backend TTL: 120 seconds
 */
export function useProductsQuery(params?: ProductListParams) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: async () => {
      return await productsApi.list(params);
    },
    staleTime: 120 * 1000, // 2 minutes (matches backend Redis cache TTL)
    gcTime: 10 * 60 * 1000, // Keep in memory for 10 minutes
  });
}

/**
 * Hook for single product detail
 * Backend TTL: 300 seconds
 */
export function useProductDetailsQuery(id: string) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: async () => {
      if (!id) return null;
      return await productsApi.getById(id);
    },
    enabled: !!id,
    staleTime: 300 * 1000, // 5 minutes (matches backend Redis cache TTL)
    gcTime: 15 * 60 * 1000, // Keep in memory for 15 minutes
  });
}

/**
 * Mutation: Create Product
 * Mirrors backend delPattern("products:") by invalidating all product queries
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<Product>) => productsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
    },
  });
}

/**
 * Mutation: Update Product
 * Mirrors backend delPattern("products:")
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) =>
      productsApi.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.all });
      queryClient.invalidateQueries({ queryKey: PRODUCT_KEYS.detail(variables.id) });
    },
  });
}
