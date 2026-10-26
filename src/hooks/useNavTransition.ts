'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePageTransition } from '../features/PageTransitionContext';
import { getThemeForPath } from '../theme/themeConfig';
import { useTheme } from '../theme/ThemeProvider';

export function useNavTransition() {
  const { trigger } = usePageTransition();
  const router = useRouter();
  const pathname = usePathname();
  const currentTheme = useTheme();

  return useCallback(
    (href: string, afterNavigate?: () => void) => {
      // Skip animation when already on the target page.
      if (href === pathname) return;

      router.prefetch(href);

      // Determine the destination theme so the curtain appears in the target color immediately
      const targetTheme = getThemeForPath(href) ?? currentTheme;

      trigger(() => {
        afterNavigate?.();
        router.push(href);
      }, targetTheme);
    },
    [trigger, router, pathname, currentTheme],
  );
}
