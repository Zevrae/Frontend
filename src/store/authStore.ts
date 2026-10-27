'use client';

import { create } from 'zustand';
import { authApi, LoginData, RegisterData } from '../api/auth';
import { tokenUtils } from '../utils/token';
import type { User } from './types';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoginModalOpen: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== 'undefined' ? tokenUtils.getToken() : null,
  loading: true,
  isLoginModalOpen: false,
  isInitialized: false,

  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      tokenUtils.setToken(token);
    } else {
      tokenUtils.removeToken();
    }
    set({ token });
  },
  setLoading: (loading) => set({ loading }),
  setIsLoginModalOpen: (isOpen) => set({ isLoginModalOpen: isOpen }),

  initializeAuth: async () => {
    const currentToken = tokenUtils.getToken();
    if (!currentToken) {
      set({ token: null, user: null, loading: false, isInitialized: true });
      return;
    }

    set({ loading: true });
    try {
      const userData = await authApi.getCurrentUser();
      set({
        token: currentToken,
        user: userData.data || userData,
        loading: false,
        isInitialized: true,
      });
    } catch (error) {
      console.error('Failed to restore session:', error);
      tokenUtils.removeToken();
      set({ token: null, user: null, loading: false, isInitialized: true });
    }
  },

  login: async (formData: LoginData) => {
    set({ loading: true });
    try {
      const response = await authApi.login(formData);
      const token = response.token;
      const user = response.data || response.user;

      tokenUtils.setToken(token);
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem('zevrae_user', JSON.stringify(user));
      }
      set({
        token,
        user,
        loading: false,
        isLoginModalOpen: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  loginWithGoogle: async (credential: string) => {
    set({ loading: true });
    try {
      const response = await authApi.googleLogin(credential);
      const token = response.token;
      const user = response.data || response.user;

      tokenUtils.setToken(token);
      if (typeof window !== 'undefined' && user) {
        localStorage.setItem('zevrae_user', JSON.stringify(user));
      }
      set({
        token,
        user,
        loading: false,
        isLoginModalOpen: false,
      });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  register: async (formData: RegisterData) => {
    set({ loading: true });
    try {
      const response = await authApi.register(formData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenUtils.removeToken();
      set({ token: null, user: null, loading: false });
    }
  },

  refreshUser: async () => {
    try {
      const userData = await authApi.getCurrentUser();
      set({ user: userData.data || userData });
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  },
}));
