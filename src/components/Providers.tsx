'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { CollectionTransitionProvider } from '@/features/CollectionTransitionContext';
import { ActiveCollectionProvider } from '@/features/ActiveCollectionContext';
import { PreloaderProvider } from '@/features/PreloaderContext';
import { PageTransitionProvider } from '@/features/PageTransitionContext';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/CartContext';
import { AuthModalProvider } from '@/AuthModalContext';
import { WishlistProvider } from '@/context/WishlistContext';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <CollectionTransitionProvider>
          <ActiveCollectionProvider>
            <PreloaderProvider>
              <PageTransitionProvider>
                <AuthProvider>
                  <CartProvider>
                    <AuthModalProvider>
                      <WishlistProvider>
                        {children}
                      </WishlistProvider>
                    </AuthModalProvider>
                  </CartProvider>
                </AuthProvider>
              </PageTransitionProvider>
            </PreloaderProvider>
          </ActiveCollectionProvider>
        </CollectionTransitionProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
