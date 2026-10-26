'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuthStore } from './store/authStore';

export interface AuthModalContextType {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const setIsLoginModalOpen = useAuthStore((s) => s.setIsLoginModalOpen);

  return (
    <AuthModalContext.Provider value={{ isLoginModalOpen, setIsLoginModalOpen }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context !== undefined) {
    return context;
  }
  // Fallback to Zustand store
  const isLoginModalOpen = useAuthStore((s) => s.isLoginModalOpen);
  const setIsLoginModalOpen = useAuthStore((s) => s.setIsLoginModalOpen);
  return { isLoginModalOpen, setIsLoginModalOpen };
}
