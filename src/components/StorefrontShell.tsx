'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CustomCursor } from '@/features/CustomCursor';
import { Preloader } from '@/features/preloader';
import { PageTransitionLoader } from '@/features/PageTransitionLoader';
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
      <CustomCursor />
      {!hasCompletedOnce && <Preloader />}
      <PageTransitionLoader />

      {/* Global Film Grain */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 mix-blend-difference"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      <StorefrontNav />

      <div className="flex-grow flex flex-col">{children}</div>

      <TryOnReviewTicker />
      <Footer />

      <CartDrawer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
