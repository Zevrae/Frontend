import api from './api';

export interface Discount {
  id: string;
  code: string;
  type: 'Percentage' | 'Fixed Amount';
  value: number;
  usage: { used: number; limit: number };
  expiry: string;
  status: 'Active' | 'Expired';
  created_at: string;
}

export const discountsApi = {
  // Admin only
  list: async (): Promise<Discount[]> => {
    const response = await api.get('/discounts');
    return response.data.data;
  },

  // Public — looks up a code without validating/consuming it
  getByCode: async (code: string): Promise<Discount> => {
    const response = await api.get(`/discounts/${code}`);
    return response.data.data;
  },

  // Preview/validate a code against a subtotal (smallest currency unit).
  // Does NOT consume a use — safe to call from the checkout "Apply" button.
  preview: async (code: string, subtotal: number): Promise<{ data: Discount; discountAmount: number }> => {
    const response = await api.post('/discounts/use', { code, subtotal });
    return response.data;
  },

  create: async (payload: {
    code: string;
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    usage: { limit: number };
    expiry: string;
    status?: 'Active' | 'Expired';
  }): Promise<Discount> => {
    const response = await api.post('/discounts', payload);
    return response.data.data;
  },

  update: async (id: string, payload: Partial<{
    type: 'Percentage' | 'Fixed Amount';
    value: number;
    usage: { limit: number; used?: number };
    expiry: string;
    status: 'Active' | 'Expired';
  }>): Promise<Discount> => {
    const response = await api.put(`/discounts/${id}`, payload);
    return response.data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/discounts/${id}`);
  },
};
