import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { wishlistApi, WishlistProduct } from '../api/wishlist';
import { useAuth } from '../hooks/UseAuth';

interface WishlistContextValue {
  /** Set of product IDs currently in the wishlist */
  wishlistIds: Set<string>;
  /** Full product objects for all wishlisted items */
  items: WishlistProduct[];
  loading: boolean;
  /** Toggle a product in/out of the wishlist. Returns true if added, false if removed. */
  toggle: (product: { id: string; name: string; price: number; images?: string[]; category?: string }) => Promise<boolean>;
  isWishlisted: (productId: string) => boolean;
  /** Re-fetch from server (called after login) */
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(false);

  const wishlistIds = new Set(items.map(p => p.id));

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items],
  );

  // Keep a ref so toggle callbacks always see the latest items without
  // causing stale-closure issues.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    try {
      const fetched = await wishlistApi.get();
      setItems(fetched.map(wi => wi.product));
    } catch {
      // Silently ignore — wishlist is a non-critical feature
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch on login / logout
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = useCallback(
    async (product: { id: string; name: string; price: number; images?: string[]; category?: string }): Promise<boolean> => {
      if (!user) return false;

      const alreadyIn = itemsRef.current.some(p => p.id === product.id);

      // Optimistic update
      if (alreadyIn) {
        setItems(prev => prev.filter(p => p.id !== product.id));
      } else {
        const optimistic: WishlistProduct = {
          id: product.id,
          name: product.name,
          price: product.price,
          images: product.images ?? [],
          category: product.category ?? '',
          status: 'active',
        };
        setItems(prev => [optimistic, ...prev]);
      }

      try {
        if (alreadyIn) {
          await wishlistApi.remove(product.id);
          return false;
        } else {
          await wishlistApi.add(product.id);
          return true;
        }
      } catch {
        // Revert optimistic update on failure
        if (alreadyIn) {
          setItems(prev => {
            const optimistic: WishlistProduct = {
              id: product.id,
              name: product.name,
              price: product.price,
              images: product.images ?? [],
              category: product.category ?? '',
              status: 'active',
            };
            return [optimistic, ...prev];
          });
        } else {
          setItems(prev => prev.filter(p => p.id !== product.id));
        }
        return alreadyIn; // unchanged
      }
    },
    [user],
  );

  return (
    <WishlistContext.Provider value={{ wishlistIds, items, loading, toggle, isWishlisted, refresh }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
