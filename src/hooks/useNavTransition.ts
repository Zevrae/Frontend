'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePageTransition } from '../features/PageTransitionContext';

/**
 * Drop-in replacement for `const { trigger: navTransition } = usePageTransition()`.
 *
 * Fixes the first-click slowness by calling router.prefetch(href) immediately
 * when navigation is triggered, so the route bundle download races the curtain
 * animation (~0.85 s) instead of starting only after it finishes.
 *
 * Also skips the transition when the target href is already the current page,
 * so clicking the same nav item twice doesn't play an animation for nothing.
 *
 * Usage:
 *   const navTransition = useNavTransition();
 *   <button onClick={() => navTransition('/men')}>MEN</button>
 *
 * With an extra callback (e.g. close a dropdown):
 *   navTransition('/men', () => setIsClothingOpen(false));
 */
export function useNavTransition() {
  const { trigger } = usePageTransition();
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(
    (href: string, afterNavigate?: () => void) => {
      // Skip animation when already on the target page.
      if (href === pathname) return;

      // Kick off prefetch immediately so the route bundle / RSC payload
      // downloads during the 0.85 s entering animation, not after it.
      router.prefetch(href);

      trigger(() => {
        afterNavigate?.();
        router.push(href);
      });
    },
    [trigger, router, pathname],
  );
}
