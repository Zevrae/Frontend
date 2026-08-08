import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getThemeForPath, type ThemeName } from './themeConfig';

const ThemeContext = createContext<ThemeName>('clothing');

/** Read the active category theme anywhere in the tree, if a component
 * ever needs to branch on it in JS instead of pure CSS. */
export function useTheme(): ThemeName {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [theme, setTheme] = useState<ThemeName>(() => getThemeForPath(location.pathname));

  useEffect(() => {
    setTheme(getThemeForPath(location.pathname));
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

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
