import api from './api';

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number; // stored as smallest currency unit (integer)
  compare_price?: number | null; // optional — stored as smallest currency unit (integer)
  discount?: number | null; // manual discount percentage override (0-100), independent of compare_price
  images: string[];
  sizes: string[];
  size_stock: Record<string, number>;
  stock_quantity: number; // server-derived total across size_stock — read only, don't send this on create/update
  status: 'active' | 'inactive' | 'draft' | 'archived';
  collections: string[]; // multiple collection IDs
  created_at: string;
  updated_at: string;
  is_deleted?: boolean; // optional, since excluded by default queries
  deleted_at?: string | null;
}

export interface ProductListParams {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  collection?: string; // single collection filter
  status?: string;
  search?: string;
  sort?: string;
}

export const productsApi = {
  list: async (params?: ProductListParams) => {
    const response = await api.get('/products', { params });
    return response.data as {
      success: boolean;
      data: Product[];
      pagination: { page: number; limit: number; total: number; pages: number };
    };
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  create: async (payload: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  restore: async (id: string): Promise<Product> => {
    const response = await api.patch(`/products/${id}/restore`);
    return response.data.data;
  },

  uploadImages: async (id: string, files: File[]): Promise<Product> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  deleteImage: async (id: string, imageUrl: string): Promise<Product> => {
    const response = await api.delete(`/products/${id}/images`, { data: { imageUrl } });
    return response.data.data;
  },
};
