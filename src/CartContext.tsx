import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './hooks/UseAuth';
import { cartApi, Cart } from './api/cart';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string, size: string) => void;
  updateQuantity: (id: string, size: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// The backend cart only stores { product, size, quantity, name, price } — it
// has no notion of image/category, so we keep those client-side and merge
// them back in after every sync. If a product later drops out of the local
// catalog cache the row still renders (just without image/category).
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

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('zevrae_guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist guest cart to local storage whenever it changes
  useEffect(() => {
    if (!token) {
      localStorage.setItem('zevrae_guest_cart', JSON.stringify(items));
    }
  }, [items, token]);

  // Hydrate from the backend whenever the user logs in. Guests keep a
  // purely local, in-memory cart (there's nothing to hydrate from, and
  // nothing is persisted between sessions for them).
  useEffect(() => {
    if (!token) return;
    cartApi
      .getCart()
      .then((cart) => setItems((prev) => mergeDisplayFields(cart.items, prev)))
      .catch((err) => console.error('Failed to load cart:', err));
  }, [token]);

  const addToCart = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
        };
        return updatedItems;
      }

      return [...currentItems, newItem];
    });
    setIsCartOpen(true);

    if (token) {
      cartApi.addItem(newItem.id, newItem.size, newItem.quantity).catch((err) => {
        console.error('Failed to sync cart addition:', err);
      });
    }
  };

  const removeFromCart = (id: string, size: string) => {
    setItems((currentItems) => currentItems.filter((item) => !(item.id === id && item.size === size)));

    if (token) {
      cartApi
        .getCart()
        .then((cart) => {
          const match = cart.items.find((i) => i.product === id && i.size === size);
          if (match) return cartApi.removeItem(match.id!);
        })
        .catch((err) => console.error('Failed to sync cart removal:', err));
    }
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id === id && item.size === size) {
            return { ...item, quantity: item.quantity + delta };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );

    if (token) {
      cartApi
        .getCart()
        .then((cart) => {
          const match = cart.items.find((i) => i.product === id && i.size === size);
          if (!match) return;
          const itemId = match.id!;
          const newQty = match.quantity + delta;
          return newQty > 0 ? cartApi.updateItem(itemId, newQty) : cartApi.removeItem(itemId);
        })
        .catch((err) => console.error('Failed to sync cart quantity:', err));
    }
  };

  const clearCart = () => {
    setItems([]);
    if (token) {
      cartApi.clearCart().catch((err) => console.error('Failed to clear backend cart:', err));
    }
  };

  const cartTotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, isCartOpen, setIsCartOpen, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
