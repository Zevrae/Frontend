import api from './api';

export interface Review {
  id: string;
  product: string;
  user: { id: string; name: string } | string;
  rating: number;
  comment?: string;
  images: string[];
  created_at: string;
  updated_at: string;
}

export interface ReviewSummary {
  averageRating: number;
  count: number;
}

export const reviewsApi = {
  list: async (productId: string, params?: { page?: number; limit?: number }) => {
    const response = await api.get(`/products/${productId}/reviews`, { params });
    return response.data as {
      success: boolean;
      data: Review[];
      summary: ReviewSummary;
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },

  // images are uploaded straight to Appwrite Storage by the backend — up to
  // 5 photos per review.
  create: async (productId: string, rating: number, comment: string, images: File[]): Promise<Review> => {
    const formData = new FormData();
    formData.append('rating', String(rating));
    if (comment) formData.append('comment', comment);
    images.forEach((file) => formData.append('images', file));

    const response = await api.post(`/products/${productId}/reviews`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  update: async (
    reviewId: string,
    updates: { rating?: number; comment?: string; images?: File[] },
  ): Promise<Review> => {
    const formData = new FormData();
    if (updates.rating !== undefined) formData.append('rating', String(updates.rating));
    if (updates.comment !== undefined) formData.append('comment', updates.comment);
    (updates.images || []).forEach((file) => formData.append('images', file));

    const response = await api.put(`/reviews/${reviewId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  remove: async (reviewId: string) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data as { success: boolean; message: string };
  },

  // Fetches the most-recent reviews site-wide (any product) for the scrolling
  // ticker strip. Returns an empty array silently if the endpoint is unavailable.
  listAll: (params?: { page?: number; limit?: number }): Promise<Review[]> => {
    const FLAG = 'reviews_listall_unavailable';
    try {
      if (typeof window !== 'undefined' && sessionStorage.getItem(FLAG)) {
        return Promise.resolve([]);
      }
    } catch {
      /* sessionStorage unavailable */
    }
    if (!listAllPromise) {
      listAllPromise = api
        .get('/reviews', {
          params: { limit: 40, ...params },
          validateStatus: (s: number) => s < 500,
        })
        .then((response: any) => {
          if (response.status === 404) {
            // Endpoint doesn't exist on the backend — remember so we never retry.
            try {
              sessionStorage.setItem(FLAG, '1');
            } catch {
              /* ignore */
            }
            return [] as Review[];
          }
          const body = response.data;
          // Some backends return { data: [...] }, others return the array directly.
          return (Array.isArray(body) ? body : (body?.data ?? [])) as Review[];
        })
        .catch(() => [] as Review[]);
    }
    return listAllPromise;
  },
};

let listAllPromise: Promise<Review[]> | null = null;
