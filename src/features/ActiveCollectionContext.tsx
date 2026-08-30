/**
 * ActiveCollectionContext
 *
 * Tracks which collection tab is currently active on the homepage
 * (CLOTHING / JEWELLERY / ACCESSORIES).
 *
 * CollectionScroller is the *writer* — it calls setActiveCollectionId
 * whenever activeIdx changes (inside the same effect that updates the theme).
 *
 * BestSellers is the *reader* — it reacts to activeCollectionId to
 * filter and display the correct set of best-selling products.
 *
 * This context deliberately holds only a simple string ID (not the full
 * Collection object) so it remains a lean, single-purpose channel.
 */

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import type { ThemeName } from '../theme/themeConfig';

interface ActiveCollectionContextValue {
  /** The ID of the currently active homepage collection tab. */
  activeCollectionId: ThemeName;
  /** Called by CollectionScroller when the active tab changes. */
  setActiveCollectionId: (id: ThemeName) => void;
}

const ActiveCollectionContext = createContext<ActiveCollectionContextValue>({
  activeCollectionId: 'clothing',
  setActiveCollectionId: () => {},
});

export function useActiveCollection(): ActiveCollectionContextValue {
  return useContext(ActiveCollectionContext);
}

export function ActiveCollectionProvider({ children }: { children: ReactNode }) {
  const [activeCollectionId, setActiveCollectionIdState] = useState<ThemeName>('clothing');

  const setActiveCollectionId = useCallback((id: ThemeName) => {
    setActiveCollectionIdState(id);
  }, []);

  return (
    <ActiveCollectionContext.Provider value={{ activeCollectionId, setActiveCollectionId }}>
      {children}
    </ActiveCollectionContext.Provider>
  );
}
