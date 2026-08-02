import api from './api';

export interface TryonResult {
  id: string;
  user: string;
  product: string | { id: string; name: string; images: string[] };
  imageUrl?: string;
  status: 'pending' | 'completed' | 'failed';
  error?: string;
  clothImageUrls: string[];
  created_at: string;
}

export const tryonApi = {
  // clothImageUrls: URLs of the product's own images the shopper picked to
  // try on (one or more). The backend resolves and fetches these itself via
  // its Appwrite SDK — the browser never needs to fetch() Appwrite directly,
  // which sidesteps Appwrite's CORS restrictions.
  //
  // This starts a background job and returns almost immediately (status:
  // 'pending') — it does NOT wait for generation to finish. Actual
  // generation takes 25-40s, which is too long/fragile to hold open as a
  // single HTTP request in production (proxy/load-balancer timeouts). Poll
  // getStatus() with the returned id until status is 'completed' or 'failed'.
  start: async (productId: string, personImage: File, clothImageUrls: string[]): Promise<TryonResult> => {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('person_image', personImage);
    formData.append('clothImageUrls', JSON.stringify(clothImageUrls));

    const response = await api.post('/tryon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  getStatus: async (id: string): Promise<TryonResult> => {
    const response = await api.get(`/tryon/${id}/status`);
    return response.data.data;
  },

  history: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get('/tryon', { params });
    return response.data as {
      success: boolean;
      data: TryonResult[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },
};
