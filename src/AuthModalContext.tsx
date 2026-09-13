'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthModalContextType {
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <AuthModalContext.Provider value={{ isLoginModalOpen, setIsLoginModalOpen }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
