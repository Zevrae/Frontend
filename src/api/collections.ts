import api from './api';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  featured: boolean;
  created_at: string;
}

export const collectionsApi = {
  list: async (params?: { status?: string; featured?: boolean }) => {
    const response = await api.get('/collections', { params });
    return response.data as { success: boolean; data: Collection[] };
  },

  create: async (payload: { name: string; description?: string; status?: string; featured?: boolean }): Promise<Collection> => {
    const response = await api.post('/collections', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<{ name: string; description: string; status: string; featured: boolean }>): Promise<Collection> => {
    const response = await api.put(`/collections/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },
};
