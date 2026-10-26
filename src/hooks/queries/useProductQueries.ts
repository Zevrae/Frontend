'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi, ProductListParams, Product } from '@/api/products';

export const PRODUCT_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_KEYS.all, 'list'] as const,
  list: (params?: ProductListParams) => [...PRODUCT_KEYS.lists(), params] as const,
  details: () => [...PRODUCT_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PRODUCT_KEYS.details(), id] as const,
};

/**
 * Query hook for listing products with caching and revalidation
 */
export function useProductsQuery(params?: ProductListParams) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: async () => {
      return await productsApi.list(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Query hook for a single product by ID
 */
export function useProductDetailsQuery(id: string) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(id),
    queryFn: async () => {
      if (!id) return null;
      return await productsApi.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
