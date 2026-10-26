'use client';

import { create } from 'zustand';
import { wishlistApi, WishlistProduct } from '../api/wishlist';
import { useAuthStore } from './authStore';

export interface WishlistState {
  items: WishlistProduct[];
  wishlistIds: Set<string>;
  loading: boolean;

  // Actions
  setItems: (items: WishlistProduct[]) => void;
  isWishlisted: (productId: string) => boolean;
  toggle: (product: { id: string; name: string; price: number; images?: string[]; category?: string }) => Promise<boolean>;
  refresh: () => Promise<void>;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  wishlistIds: new Set<string>(),
  loading: false,

  setItems: (items: WishlistProduct[]) => {
    set({
      items,
      wishlistIds: new Set(items.map((i) => i.id)),
    });
  },

  isWishlisted: (productId: string) => {
    return get().wishlistIds.has(productId);
  },

  clearWishlist: () => {
    set({ items: [], wishlistIds: new Set() });
  },

  refresh: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ items: [], wishlistIds: new Set(), loading: false });
      return;
    }

    set({ loading: true });
    try {
      const fetched = await wishlistApi.get();
      const productList = fetched.map((wi) => wi.product).filter(Boolean);
      set({
        items: productList,
        wishlistIds: new Set(productList.map((p) => p.id)),
        loading: false,
      });
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
      set({ loading: false });
    }
  },

  toggle: async (product) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      useAuthStore.getState().setIsLoginModalOpen(true);
      return false;
    }

    const previousItems = get().items;
    const alreadyIn = previousItems.some((p) => p.id === product.id);

    // Optimistic update
    let nextItems: WishlistProduct[];
    if (alreadyIn) {
      nextItems = previousItems.filter((p) => p.id !== product.id);
    } else {
      const optimistic: WishlistProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images ?? [],
        category: product.category ?? '',
        status: 'active',
      };
      nextItems = [optimistic, ...previousItems];
    }

    set({
      items: nextItems,
      wishlistIds: new Set(nextItems.map((p) => p.id)),
    });

    try {
      if (alreadyIn) {
        await wishlistApi.remove(product.id);
        return false;
      } else {
        await wishlistApi.add(product.id);
        return true;
      }
    } catch (err) {
      // Revert optimistic update
      console.error('Failed to toggle wishlist item:', err);
      set({
        items: previousItems,
        wishlistIds: new Set(previousItems.map((p) => p.id)),
      });
      return alreadyIn;
    }
  },
}));
