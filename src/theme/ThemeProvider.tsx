import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { getThemeForPath, DEFAULT_THEME, type ThemeName } from './themeConfig';

interface ThemeContextValue {
  theme: ThemeName;
  /** Force a theme regardless of route — used by in-page scroll experiences
   * (e.g. the homepage CollectionScroller) that want the palette to follow
   * whichever category is currently in view without actually navigating. */
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

// Persists the last *effective* theme so a hard refresh (or reopening the
// tab) on a non-category route — /product/:id, /bag, /checkout, /profile,
// etc. — restores whatever palette was actually on screen instead of
// silently falling back to DEFAULT_THEME. Category routes still win on
// every load (see getThemeForPath below); this only fills in the gap for
// routes that don't define a category of their own.
const THEME_STORAGE_KEY = 'zevrae:theme';
const VALID_THEMES: ThemeName[] = ['clothing', 'jewellery', 'accessories'];

function isValidTheme(value: unknown): value is ThemeName {
  return typeof value === 'string' && (VALID_THEMES as string[]).includes(value);
}

function readStoredTheme(): ThemeName | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(stored) ? stored : null;
  } catch {
    // localStorage can throw in private-browsing / storage-disabled
    // contexts — fall back to the default rather than letting init crash.
    return null;
  }
}

function persistTheme(theme: ThemeName) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Best-effort only — persistence isn't critical to the page working.
  }
}

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
  // Initialization order: a category route (e.g. /jewellery/...) always
  // wins, since that's an explicit, unambiguous signal. Otherwise fall back
  // to whatever theme was last persisted (so refreshing on /product/:id or
  // /checkout doesn't flash back to DEFAULT_THEME), and only use
  // DEFAULT_THEME when neither is available (first-ever visit, or a
  // corrupted/missing localStorage value).
  const [theme, setThemeState] = useState<ThemeName>(
    () => getThemeForPath(location.pathname) ?? readStoredTheme() ?? DEFAULT_THEME,
  );

  // Route change only overrides the palette when the new route actually
  // belongs to a category. Non-category routes (product detail, cart,
  // checkout, profile, admin, policy pages...) return `null` and the
  // currently active theme is left untouched — that's what makes it
  // "persist" when you open a product instead of a category listing.
  useEffect(() => {
    const next = getThemeForPath(location.pathname);
    if (next !== null) {
      setThemeState(next);
    }
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
    // Every theme change — whether from route navigation, the scroll-linked
    // override, or a future explicit theme switcher — is persisted
    // immediately so the next load/refresh picks up right where this one
    // left off.
    persistTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeName) => setThemeState(next), []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}
