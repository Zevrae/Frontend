'use client';

import React, { createContext, useContext, useEffect, useMemo, ReactNode } from 'react';
import { useAuth } from './hooks/UseAuth';
import { useCartStore, MAX_QTY_PER_SIZE as STORE_MAX_QTY } from './store/cartStore';
import type { CartItem } from './store/types';

export const MAX_QTY_PER_SIZE = STORE_MAX_QTY;
export type { CartItem };

export interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => number;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { token, loading: authLoading } = useAuth();
  
  const items = useCartStore((s) => s.items);
  const isLoaded = useCartStore((s) => s.isLoaded);
  const isCartOpen = useCartStore((s) => s.isCartOpen);
  const loadCartFromStorage = useCartStore((s) => s.loadCartFromStorage);
  const syncWithBackend = useCartStore((s) => s.syncWithBackend);
  const addToCart = useCartStore((s) => s.addToCart);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const setIsCartOpen = useCartStore((s) => s.setIsCartOpen);

  // Initialize storage
  useEffect(() => {
    if (!isLoaded) {
      loadCartFromStorage();
    }
  }, [isLoaded, loadCartFromStorage]);

  // Sync with backend on authentication
  useEffect(() => {
    if (authLoading || !token) return;
    syncWithBackend();
  }, [token, authLoading, syncWithBackend]);

  const cartTotal = useMemo(
    () => items.reduce((total, item) => total + item.price * item.quantity, 0),
    [items]
  );

  const contextValue = useMemo(
    () => ({
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      cartTotal,
    }),
    [items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, cartTotal]
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context !== undefined) {
    return context;
  }
  // Store fallback
  const store = useCartStore.getState();
  return {
    items: store.items,
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isCartOpen: store.isCartOpen,
    setIsCartOpen: store.setIsCartOpen,
    cartTotal: store.cartTotal(),
  };
}
