'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, LoginData, RegisterData } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { tokenUtils } from '@/utils/token';

export const AUTH_KEYS = {
  all: ['auth'] as const,
  currentUser: () => [...AUTH_KEYS.all, 'currentUser'] as const,
};

/**
 * Query hook for current authenticated user profile
 */
export function useCurrentUserQuery() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: AUTH_KEYS.currentUser(),
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      const user = response.data || response;
      setUser(user);
      return user;
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
  });
}

/**
 * Mutation hook for logging in
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const loginAction = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (data: LoginData) => {
      await loginAction(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUTH_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });
}

/**
 * Mutation hook for registering
 */
export function useRegisterMutation() {
  const registerAction = useAuthStore((state) => state.register);

  return useMutation({
    mutationFn: async (data: RegisterData) => {
      return await registerAction(data);
    },
  });
}

/**
 * Mutation hook for logging out
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const logoutAction = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: async () => {
      await logoutAction();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
}
