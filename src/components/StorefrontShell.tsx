'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CustomCursor } from '@/features/CustomCursor';
import { Preloader } from '@/features/preloader';
import { PageTransitionLoader } from '@/features/PageTransitionLoader';
import { SmoothScroll } from '@/features/SmoothScroll';
import { usePreloader } from '@/features/PreloaderContext';
import { useAuthModal } from '@/AuthModalContext';
import { StorefrontNav } from '@/components/StorefrontNav';
import { Footer } from '@/components/Footer';
import TryOnReviewTicker from '@/components/TryOnReviewTicker';
import LoginModal from '@/LoginModal';
import CartDrawer from '@/CartDrawer';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading, hasCompletedOnce } = usePreloader();
  const { isLoginModalOpen, setIsLoginModalOpen } = useAuthModal();

  // Prevent scrolling during preloader
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLoading]);

  return (
    <div
      data-page-content
      className="flex flex-col min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] selection:bg-[rgba(var(--theme-accent-rgb),0.3)] selection:text-[var(--theme-text)] relative overflow-x-hidden font-sans"
    >
      <SmoothScroll />
      <CustomCursor />
      {!hasCompletedOnce && <Preloader />}
      <PageTransitionLoader />

      <StorefrontNav />

      <div className="flex-grow flex flex-col">{children}</div>

      <TryOnReviewTicker />
      <Footer />

      <CartDrawer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
