'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { CollectionTransitionProvider } from '@/features/CollectionTransitionContext';
import { ActiveCollectionProvider } from '@/features/ActiveCollectionContext';
import { PreloaderProvider } from '@/features/PreloaderContext';
import { PageTransitionProvider } from '@/features/PageTransitionContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/CartContext';
import { AuthModalProvider } from '@/AuthModalContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <CollectionTransitionProvider>
        <ActiveCollectionProvider>
          <PreloaderProvider>
            <PageTransitionProvider>
              <AuthProvider>
                <CartProvider>
                  <AuthModalProvider>
                    {children}
                  </AuthModalProvider>
                </CartProvider>
              </AuthProvider>
            </PageTransitionProvider>
          </PreloaderProvider>
        </ActiveCollectionProvider>
      </CollectionTransitionProvider>
    </ThemeProvider>
  );
}
