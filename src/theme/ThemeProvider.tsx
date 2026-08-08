import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getThemeForPath, type ThemeName } from './themeConfig';

interface ThemeContextValue {
  theme: ThemeName;
  /** Force a theme regardless of route — used by in-page scroll experiences
   * (e.g. the homepage CollectionScroller) that want the palette to follow
   * whichever category is currently in view without actually navigating. */
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'clothing',
  setTheme: () => {},
});

/** Read the active category theme anywhere in the tree. */
export function useTheme(): ThemeName {
  return useContext(ThemeContext).theme;
}

/** Imperatively override the active theme (e.g. while scrubbing through a
 * scroll-linked slider). Route navigation will still take precedence the
 * next time the pathname changes. */
export function useSetTheme(): (theme: ThemeName) => void {
  return useContext(ThemeContext).setTheme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [theme, setThemeState] = useState<ThemeName>(() => getThemeForPath(location.pathname));

  // Route change always wins — whatever a slider left the theme on gets
  // overridden the moment the URL actually changes category.
  useEffect(() => {
    setThemeState(getThemeForPath(location.pathname));
  }, [location.pathname]);

  useEffect(() => {
    // The route only actually swaps to the new URL once the curtain in
    // PageTransitionLoader is fully covering the screen (see how `trigger`
    // + `navigate` are sequenced in App.tsx/PageTransitionContext), so by
    // the time this effect runs during a normal in-app navigation the
    // palette flips while hidden behind the curtain "sliding up". On a
    // direct load / refresh / back-button there's no curtain to hide
    // behind, so the CSS `transition` declared on `html`/`body` for these
    // custom properties takes over instead, and the palette crossfades.
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => setThemeState(next), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
