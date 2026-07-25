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
};
