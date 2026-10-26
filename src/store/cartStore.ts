'use client';

import { create } from 'zustand';
import { cartApi, Cart } from '../api/cart';
import { productsApi } from '../api/products';
import { tokenUtils } from '../utils/token';
import type { CartItem } from './types';

export const MAX_QTY_PER_SIZE = 2;

const mergeDisplayFields = (backendItems: Cart['items'], previous: CartItem[]): CartItem[] => {
  return backendItems.map((bi) => {
    const match = previous.find((p) => p.id === bi.product && p.size === bi.size);
    return {
      id: bi.product,
      name: bi.name,
      price: bi.price,
      size: bi.size || '',
      quantity: bi.quantity,
      image: match?.image || '',
      category: match?.category || '',
    };
  });
};

export interface CartState {
  items: CartItem[];
  isLoaded: boolean;
  isCartOpen: boolean;

  // Selectors/Computed
  cartTotal: () => number;
  cartCount: () => number;

  // Actions
  setIsCartOpen: (isOpen: boolean) => void;
  loadCartFromStorage: () => void;
  addToCart: (item: CartItem) => number;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, delta: number) => void;
  clearCart: () => void;
  syncWithBackend: () => Promise<void>;
  setItems: (items: CartItem[]) => void;
}

const persistCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('zevrae_cart_cache', JSON.stringify(items));
    const token = tokenUtils.getToken();
    if (!token) {
      localStorage.setItem('zevrae_guest_cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('zevrae_guest_cart');
    }
  } catch (err) {
    console.error('Failed to persist cart:', err);
  }
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoaded: false,
  isCartOpen: false,

  cartTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  cartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  setIsCartOpen: (isOpen: boolean) => set({ isCartOpen: isOpen }),

  setItems: (items: CartItem[]) => {
    persistCart(items);
    set({ items });
  },

  loadCartFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('zevrae_cart_cache') || localStorage.getItem('zevrae_guest_cart');
      if (saved) {
        set({ items: JSON.parse(saved), isLoaded: true });
        return;
      }
    } catch (err) {
      console.error('Failed to parse cart cache:', err);
    }
    set({ isLoaded: true });
  },

  syncWithBackend: async () => {
    const token = tokenUtils.getToken();
    if (!token) return;

    try {
      const cart = await cartApi.getCart();
      const current = get().items;
      let merged = mergeDisplayFields(cart.items, current);

      // Check for missing product images
      const missingImageItems = merged.filter((item) => !item.image);
      if (missingImageItems.length > 0) {
        try {
          const uniqueIds = Array.from(new Set(missingImageItems.map((i) => i.id)));
          const products = await Promise.all(
            uniqueIds.map((id) => productsApi.getById(id).catch(() => null))
          );

          merged = merged.map((item) => {
            if (!item.image) {
              const p = products.find(
                (prod) => prod && (prod.id === item.id || (prod as any).$id === item.id)
              );
              if (p) {
                const imgs = Array.isArray(p.images)
                  ? p.images
                  : typeof p.images === 'string'
                  ? JSON.parse(p.images)
                  : [];
                return { ...item, image: imgs[0] || '', category: p.category || '' };
              }
            }
            return item;
          });
        } catch (e) {
          console.error('Failed to fetch missing cart item details:', e);
        }
      }

      persistCart(merged);
      set({ items: merged });
    } catch (err) {
      console.error('Failed to load backend cart:', err);
    }
  },

  addToCart: (newItem: CartItem): number => {
    let addedQty = 0;
    const currentItems = get().items;
    const existingItemIndex = currentItems.findIndex(
      (item) => item.id === newItem.id && item.size === newItem.size
    );
    const currentQty = existingItemIndex > -1 ? currentItems[existingItemIndex].quantity : 0;
    const allowedQty = Math.max(0, Math.min(newItem.quantity, MAX_QTY_PER_SIZE - currentQty));
    addedQty = allowedQty;

    if (allowedQty === 0) {
      return 0;
    }

    let updatedItems: CartItem[];
    if (existingItemIndex > -1) {
      updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + allowedQty,
      };
    } else {
      updatedItems = [...currentItems, { ...newItem, quantity: allowedQty }];
    }

    persistCart(updatedItems);
    set({ items: updatedItems, isCartOpen: true });

    const token = tokenUtils.getToken();
    if (token) {
      cartApi.addItem(newItem.id, newItem.size, addedQty).catch((err) => {
        console.error('Failed to sync cart addition:', err);
      });
    }

    return addedQty;
  },

  removeFromCart: (id: string, size: string) => {
    const updated = get().items.filter((item) => !(item.id === id && item.size === size));
    persistCart(updated);
    set({ items: updated });

    const token = tokenUtils.getToken();
    if (token) {
      cartApi
        .getCart()
        .then((cart) => {
          const match = cart.items.find((i) => i.product === id && i.size === size);
          if (match) return cartApi.removeItem(match.id!);
        })
        .catch((err) => console.error('Failed to sync cart removal:', err));
    }
  },

  updateQuantity: (id: string, size: string, delta: number) => {
    const updated = get()
      .items.map((item) => {
        if (item.id === id && item.size === size) {
          const nextQty = Math.min(item.quantity + delta, MAX_QTY_PER_SIZE);
          return { ...item, quantity: nextQty };
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    persistCart(updated);
    set({ items: updated });

    const token = tokenUtils.getToken();
    if (token) {
      cartApi
        .getCart()
        .then((cart) => {
          const match = cart.items.find((i) => i.product === id && i.size === size);
          if (!match) return;
          const itemId = match.id!;
          const newQty = Math.min(match.quantity + delta, MAX_QTY_PER_SIZE);
          return newQty > 0 ? cartApi.updateItem(itemId, newQty) : cartApi.removeItem(itemId);
        })
        .catch((err) => console.error('Failed to sync cart quantity:', err));
    }
  },

  clearCart: () => {
    persistCart([]);
    set({ items: [] });

    const token = tokenUtils.getToken();
    if (token) {
      cartApi.clearCart().catch((err) => console.error('Failed to clear backend cart:', err));
    }
  },
}));
