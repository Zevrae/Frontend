import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi, LoginData, RegisterData } from '../api/auth';
import { tokenUtils } from '../utils/token';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  is_active: boolean;
  is_email_verified: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<any>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenUtils.getToken());
  const [loading, setLoading] = useState<boolean>(true);

  // On startup: restore authenticated user if a token is stored
  useEffect(() => {
    const initAuth = async () => {
      const currentToken = tokenUtils.getToken();
      if (currentToken) {
        try {
          const userData = await authApi.getCurrentUser();
          setUser(userData.data || userData);
          setToken(currentToken);
        } catch (error) {
          console.error('Failed to restore session:', error);
          tokenUtils.removeToken();
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (formData: LoginData) => {
    setLoading(true);
    try {
      const response = await authApi.login(formData);
      const { token, data } = response;

      tokenUtils.setToken(token);
      setToken(token);
      setUser(data);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register does NOT log the user in — no token or user state is set.
  // Just returns the backend response so the UI can show the success message.
  const register = async (formData: RegisterData) => {
    setLoading(true);
    try {
      const response = await authApi.register(formData);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenUtils.removeToken();
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
