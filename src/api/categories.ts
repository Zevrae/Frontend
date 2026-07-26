import api from './api';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent: string | { id: string; name: string; slug: string } | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export const categoriesApi = {
  list: async (params?: { status?: string; parent?: string | null }) => {
    const response = await api.get('/categories', {
      params: params?.parent === null ? { ...params, parent: 'null' } : params,
    });
    return response.data as { success: boolean; data: Category[] };
  },

  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  create: async (payload: { name: string; description?: string; parent?: string | null; status?: string }): Promise<Category> => {
    const response = await api.post('/categories', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<{ name: string; description: string; parent: string | null; status: string }>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
