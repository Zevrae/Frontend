import api from './api';

export interface PrintAreaBox {
  left: number; // fraction 0-1 of the stage
  top: number;
  width: number;
  height: number;
}

export interface GarmentColor {
  id: string;
  label: string;
  hex: string;
  images: { front: string | null; back: string | null };
  size_stock: Record<string, number>;
}

export interface CustomizableGarment {
  id: string;
  cloth_type: string;
  label: string;
  price: number;
  sizes: string[];
  colors: GarmentColor[];
  print_areas: { front: PrintAreaBox; back: PrintAreaBox };
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const customizableGarmentsApi = {
  list: async (params?: { status?: string }) => {
    const response = await api.get('/customizable-garments', { params });
    return response.data as { success: boolean; data: CustomizableGarment[] };
  },

  getById: async (id: string): Promise<CustomizableGarment> => {
    const response = await api.get(`/customizable-garments/${id}`);
    return response.data.data;
  },

  create: async (payload: Partial<CustomizableGarment>): Promise<CustomizableGarment> => {
    const response = await api.post('/customizable-garments', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<CustomizableGarment>): Promise<CustomizableGarment> => {
    const response = await api.put(`/customizable-garments/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/customizable-garments/${id}`);
  },

  addColor: async (id: string, payload: { id: string; label: string; hex?: string; size_stock?: Record<string, number> }): Promise<CustomizableGarment> => {
    const response = await api.post(`/customizable-garments/${id}/colors`, payload);
    return response.data.data;
  },

  updateColor: async (id: string, colorId: string, payload: Partial<{ label: string; hex: string; size_stock: Record<string, number> }>): Promise<CustomizableGarment> => {
    const response = await api.put(`/customizable-garments/${id}/colors/${colorId}`, payload);
    return response.data.data;
  },

  removeColor: async (id: string, colorId: string): Promise<CustomizableGarment> => {
    const response = await api.delete(`/customizable-garments/${id}/colors/${colorId}`);
    return response.data.data;
  },

  uploadColorImages: async (id: string, colorId: string, files: { front?: File; back?: File }): Promise<CustomizableGarment> => {
    const formData = new FormData();
    if (files.front) formData.append('front', files.front);
    if (files.back) formData.append('back', files.back);
    const response = await api.post(`/customizable-garments/${id}/colors/${colorId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
};

// Turns a data-URL (as produced by the canvas compositor) into a File the
// backend's multer upload middleware can accept.
async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

export const customProductsApi = {
  // Generates a real, purchasable Product from a finished design. Claims
  // stock from the matching CustomizableGarment color/size atomically on
  // the backend — throws (via axios) with a 409 if stock ran out.
  generate: async (payload: {
    clothType: string;
    colorId: string;
    size: string;
    quantity: number;
    frontImageDataUrl: string;
    backImageDataUrl?: string | null;
  }) => {
    const formData = new FormData();
    formData.append('cloth_type', payload.clothType);
    formData.append('color_id', payload.colorId);
    formData.append('size', payload.size);
    formData.append('quantity', String(payload.quantity));
    formData.append('front', await dataUrlToFile(payload.frontImageDataUrl, 'front.png'));
    if (payload.backImageDataUrl) {
      formData.append('back', await dataUrlToFile(payload.backImageDataUrl, 'back.png'));
    }

    const response = await api.post('/custom-products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data; // the created Product
  },
};
