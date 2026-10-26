'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '@/api/reviews';

export const REVIEW_KEYS = {
  all: ['reviews'] as const,
  product: (productId: string, params?: { page?: number; limit?: number }) =>
    [...REVIEW_KEYS.all, productId, params] as const,
};

/**
 * Hook for product reviews listing
 */
export function useProductReviewsQuery(productId: string, params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: REVIEW_KEYS.product(productId, params),
    queryFn: async () => {
      if (!productId) return null;
      return await reviewsApi.list(productId, params);
    },
    enabled: !!productId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation: Create Review
 * Invalidates reviews query AND product queries
 */
export function useCreateReviewMutation(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ rating, comment, images }: { rating: number; comment: string; images: File[] }) =>
      reviewsApi.create(productId, rating, comment, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REVIEW_KEYS.all, productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
