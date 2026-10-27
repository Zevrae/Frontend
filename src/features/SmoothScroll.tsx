'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { usePreloader } from './PreloaderContext';
import { usePageTransition } from './PageTransitionContext';

/**
 * SmoothScroll — mounts a single Lenis instance for the whole storefront.
 *
 * Behaviour:
 *  - Scroll is locked while the preloader is active (body overflow is already
 *    hidden by StorefrontShell, this just prevents Lenis from fighting it).
 *  - Scroll is paused during page transitions so the curtain overlay feels
 *    clean and inertia doesn't continue underneath it.
 *  - The Lenis RAF loop is driven by GSAP ticker so it stays in sync with
 *    any GSAP animations running at the same time.
 */
export function SmoothScroll() {
  const { isLoading } = usePreloader();
  const { isTransitioning } = usePageTransition();
  const lenisRef = useRef<Lenis | null>(null);

  // Create the Lenis instance once on mount.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;

    // Drive Lenis with GSAP ticker so both stay frame-perfect.
    const onFrame = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onFrame);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onFrame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause/resume based on preloader and page-transition state.
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (isLoading || isTransitioning) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [isLoading, isTransitioning]);

  // Render nothing — this component exists only for its side effects.
  return null;
}
