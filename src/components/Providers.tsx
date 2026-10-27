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

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = (
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '115553631331-pnrdu6rammokjm3m27h46ob39h158fem.apps.googleusercontent.com'
).replace(/^['"]|['"]$/g, '').trim();

export function Providers({ children }: { children: ReactNode }) {
  const content = (
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

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {content}
      </GoogleOAuthProvider>
    );
  }

  return content;
}
