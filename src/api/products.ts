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
  inventory_mode: 'size' | 'nosize'; // 'size' = standard clothing sizes; 'nosize' = custom/no-size items (jewellery, accessories, etc.)
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
    // The backend Multer is configured to reject more than 2 files per request.
    // To allow uploading 4 or more images, we upload them sequentially one by one.
    let lastProduct: Product | undefined;
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('images', file);
      
      const response = await api.post(`/products/${id}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      lastProduct = response.data.data;
    }
    
    return lastProduct!;
  },

  deleteImage: async (id: string, imageUrl: string): Promise<Product> => {
    const response = await api.delete(`/products/${id}/images`, { data: { imageUrl } });
    return response.data.data;
  },
};
