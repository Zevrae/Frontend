'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '@/api/cart';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import type { CartItem } from '@/store/types';

export const CART_KEYS = {
  all: ['cart'] as const,
  userCart: (token: string | null) => [...CART_KEYS.all, token] as const,
};

/**
 * Query hook for user cart from backend (with automatic Zustand store sync)
 */
export function useCartQuery() {
  const token = useAuthStore((state) => state.token);
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);

  return useQuery({
    queryKey: CART_KEYS.userCart(token),
    queryFn: async () => {
      await syncWithBackend();
      return useCartStore.getState().items;
    },
    enabled: !!token,
    staleTime: 60 * 1000,
  });
}

/**
 * Mutation hook for adding to cart
 */
export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const addToCartAction = useCartStore((state) => state.addToCart);

  return useMutation({
    mutationFn: async (item: CartItem) => {
      return addToCartAction(item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}

/**
 * Mutation hook for updating quantity
 */
export function useUpdateCartQuantityMutation() {
  const queryClient = useQueryClient();
  const updateQuantityAction = useCartStore((state) => state.updateQuantity);

  return useMutation({
    mutationFn: async ({ id, size, delta }: { id: string; size: string; delta: number }) => {
      updateQuantityAction(id, size, delta);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}

/**
 * Mutation hook for removing item from cart
 */
export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  const removeFromCartAction = useCartStore((state) => state.removeFromCart);

  return useMutation({
    mutationFn: async ({ id, size }: { id: string; size: string }) => {
      removeFromCartAction(id, size);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}

/**
 * Mutation hook for clearing cart
 */
export function useClearCartMutation() {
  const queryClient = useQueryClient();
  const clearCartAction = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async () => {
      clearCartAction();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
    },
  });
}
