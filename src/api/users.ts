import api from './api';

export interface Address {
  id?: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  addresses: Address[];
  created_at: string;
}

export const usersApi = {
  updateMe: async (payload: Partial<{ name: string; phone: string; addresses: Address[] }>): Promise<UserProfile> => {
    const response = await api.put('/users/me', payload);
    return response.data.data;
  },
};
