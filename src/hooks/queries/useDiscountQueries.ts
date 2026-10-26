'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountsApi, Discount } from '@/api/discounts';

/**
 * Aligned with backend cacheRoute("discounts", 30)
 */
export const DISCOUNT_KEYS = {
  all: ['discounts'] as const,
  code: (code: string) => [...DISCOUNT_KEYS.all, code] as const,
  preview: (code: string, subtotal: number) => [...DISCOUNT_KEYS.all, 'preview', code, subtotal] as const,
};

/**
 * Hook for fetching discount by code
 * Backend TTL: 30 seconds
 */
export function useDiscountQuery(code: string) {
  return useQuery({
    queryKey: DISCOUNT_KEYS.code(code),
    queryFn: async () => {
      if (!code) return null;
      return await discountsApi.getByCode(code);
    },
    enabled: !!code && code.trim().length > 0,
    staleTime: 30 * 1000, // 30 seconds (matches backend Redis TTL)
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation: Preview / Apply Discount against checkout subtotal
 */
export function useApplyDiscountMutation() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) =>
      discountsApi.preview(code, subtotal),
  });
}

/**
 * Mutation: Create Discount
 * Mirrors backend delPattern("discounts:")
 */
export function useCreateDiscountMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: any) => discountsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DISCOUNT_KEYS.all });
    },
  });
}
