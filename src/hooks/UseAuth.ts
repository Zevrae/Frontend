import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context !== undefined) {
    return context;
  }
  // Store fallback if called outside provider
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const login = useAuthStore((s) => s.login);
  const loginWithGoogle = useAuthStore((s) => s.loginWithGoogle);
  const register = useAuthStore((s) => s.register);
  const logout = useAuthStore((s) => s.logout);
  const refreshUser = useAuthStore((s) => s.refreshUser);

  return { user, token, loading, login, loginWithGoogle, register, logout, refreshUser };
};
