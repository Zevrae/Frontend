import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './hooks/UseAuth';
import { cartApi, Cart } from './api/cart';
import { productsApi } from './api/products';

// Maximum quantity a customer may order of a single size of a single
// product. Mirrors MAX_QTY_PER_SIZE enforced on the backend (see
// backend/models/Cart.js) — kept here so the UI can cap and message
// before ever hitting the network.
export const MAX_QTY_PER_SIZE = 2;

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
  // Returns the quantity actually added (may be less than requested, or 0,
  // if the MAX_QTY_PER_SIZE cap for that product+size was already reached).
  addToCart: (item: CartItem) => number;
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
      const saved = localStorage.getItem('zevrae_cart_cache') || localStorage.getItem('zevrae_guest_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to local storage whenever it changes.
  // This acts as a robust display cache (for images/categories) across reloads for ALL users.
  useEffect(() => {
    localStorage.setItem('zevrae_cart_cache', JSON.stringify(items));
    if (!token) {
      localStorage.setItem('zevrae_guest_cart', JSON.stringify(items));
    } else {
      localStorage.removeItem('zevrae_guest_cart');
    }
  }, [items, token]);

  // Hydrate from the backend whenever the user logs in. Guests keep a
  // purely local, in-memory cart (there's nothing to hydrate from, and
  // nothing is persisted between sessions for them).
  useEffect(() => {
    if (!token) return;
    cartApi
      .getCart()
      .then(async (cart) => {
        // Initial merge using the local cache (prev)
        setItems((prev) => {
          const merged = mergeDisplayFields(cart.items, prev);
          
          // Check if any items are missing images (could happen if logged in from a new device)
          const missingImageItems = merged.filter(item => !item.image);
          if (missingImageItems.length > 0) {
            // Fetch missing product details asynchronously to populate images
            const fetchMissing = async () => {
              try {
                const uniqueIds = Array.from(new Set(missingImageItems.map(i => i.id)));
                const products = await Promise.all(uniqueIds.map(id => productsApi.getById(id).catch(() => null)));
                
                setItems((currentItems) => {
                  return currentItems.map(item => {
                    if (!item.image) {
                      const p = products.find(prod => prod && (prod.id === item.id || (prod as any).$id === item.id));
                      if (p) {
                        const imgs = Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? JSON.parse(p.images) : []);
                        return { ...item, image: imgs[0] || '', category: p.category || '' };
                      }
                    }
                    return item;
                  });
                });
              } catch (e) {
                console.error("Failed to fetch missing cart item details", e);
              }
            };
            fetchMissing();
          }
          
          return merged;
        });
      })
      .catch((err) => console.error('Failed to load cart:', err));
  }, [token]);

  // Adds an item to the cart, capping the combined quantity for that
  // product+size at MAX_QTY_PER_SIZE. Returns the quantity actually added
  // (0 if the size was already at the cap) so callers can let the user know.
  const addToCart = (newItem: CartItem): number => {
    let addedQty = 0;

    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.id === newItem.id && item.size === newItem.size
      );
      const currentQty = existingItemIndex > -1 ? currentItems[existingItemIndex].quantity : 0;
      const allowedQty = Math.max(0, Math.min(newItem.quantity, MAX_QTY_PER_SIZE - currentQty));
      addedQty = allowedQty;

      if (allowedQty === 0) {
        return currentItems;
      }

      if (existingItemIndex > -1) {
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + allowedQty,
        };
        return updatedItems;
      }

      return [...currentItems, { ...newItem, quantity: allowedQty }];
    });

    if (addedQty > 0) {
      setIsCartOpen(true);
      if (token) {
        cartApi.addItem(newItem.id, newItem.size, addedQty).catch((err) => {
          console.error('Failed to sync cart addition:', err);
        });
      }
    }

    return addedQty;
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
            const nextQty = Math.min(item.quantity + delta, MAX_QTY_PER_SIZE);
            return { ...item, quantity: nextQty };
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
          const newQty = Math.min(match.quantity + delta, MAX_QTY_PER_SIZE);
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
