import api from './api';

export interface WishlistProduct {
  id: string;
  name: string;
  price: number;
  compare_price?: number | null;
  discount?: number | null;
  images: string[];
  category: string;
  subcategory?: string;
  status: string;
}

export interface WishlistItem {
  product: WishlistProduct;
  added_at: string;
}

export const wishlistApi = {
  /** GET /wishlist — returns the authenticated user's wishlist */
  get: async (): Promise<WishlistItem[]> => {
    const response = await api.get('/wishlist');
    // Backend may return { success, data } or just an array
    const raw = response.data;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  },

  /** POST /wishlist/:productId — add a product to wishlist */
  add: async (productId: string): Promise<void> => {
    await api.post(`/wishlist/${productId}`);
  },

  /** DELETE /wishlist/:productId — remove a product from wishlist */
  remove: async (productId: string): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },
};
