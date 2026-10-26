'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWishlistStore } from '../store/wishlistStore';
import { useAuthStore } from '../store/authStore';
import type { WishlistProduct } from '../api/wishlist';

export interface WishlistContextValue {
  wishlistIds: Set<string>;
  items: WishlistProduct[];
  loading: boolean;
  toggle: (product: { id: string; name: string; price: number; images?: string[]; category?: string }) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const items = useWishlistStore((s) => s.items);
  const wishlistIds = useWishlistStore((s) => s.wishlistIds);
  const loading = useWishlistStore((s) => s.loading);
  const toggle = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted);
  const refresh = useWishlistStore((s) => s.refresh);

  // Sync on user login / logout
  useEffect(() => {
    refresh();
  }, [user, refresh]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, items, loading, toggle, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (ctx) {
    return ctx;
  }
  const store = useWishlistStore.getState();
  return {
    wishlistIds: store.wishlistIds,
    items: store.items,
    loading: store.loading,
    toggle: store.toggle,
    isWishlisted: store.isWishlisted,
    refresh: store.refresh,
  };
}
