'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';

export const WISHLIST_KEYS = {
  all: ['wishlist'] as const,
  userWishlist: (userId?: string) => [...WISHLIST_KEYS.all, userId] as const,
};

/**
 * Query hook for user wishlist from backend
 */
export function useWishlistQuery() {
  const user = useAuthStore((state) => state.user);
  const refresh = useWishlistStore((state) => state.refresh);

  return useQuery({
    queryKey: WISHLIST_KEYS.userWishlist(user?._id || user?.id),
    queryFn: async () => {
      await refresh();
      return useWishlistStore.getState().items;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Mutation hook for toggling wishlist status
 */
export function useToggleWishlistMutation() {
  const queryClient = useQueryClient();
  const toggleAction = useWishlistStore((state) => state.toggle);

  return useMutation({
    mutationFn: async (product: {
      id: string;
      name: string;
      price: number;
      images?: string[];
      category?: string;
    }) => {
      return await toggleAction(product);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WISHLIST_KEYS.all });
    },
  });
}
