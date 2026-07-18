import api from './api';

export interface LoginData {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  phone: string;
  email: string;
  password: string;
}

export const authApi = {
  login: async (data: LoginData) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {

    return api.get(`/auth/verify-email/${token}`);

},

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  }
};
