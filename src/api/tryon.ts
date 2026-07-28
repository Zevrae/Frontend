import api from './api';

export interface TryonResult {
  id: string;
  user: string;
  product: string | { id: string; name: string; images: string[] };
  imageUrl: string;
  created_at: string;
}

export const tryonApi = {
  generate: async (productId: string, personImage: File, clothImage: File): Promise<TryonResult> => {
    const formData = new FormData();
    formData.append('productId', productId);
    formData.append('person_image', personImage);
    formData.append('cloth_image', clothImage);

    const response = await api.post('/tryon', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 45000, // the underlying Gemini generation can take a while
    });
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
