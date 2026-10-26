'use client';

/**
 * ActiveCollectionContext
 *
 * Tracks which collection tab is currently active on the homepage
 * (CLOTHING / JEWELLERY / ACCESSORIES). Powered by Zustand uiStore.
 */

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import type { ThemeName } from '../theme/themeConfig';
import { useUIStore } from '../store/uiStore';

export interface ActiveCollectionContextValue {
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
  const ctx = useContext(ActiveCollectionContext);
  const activeCollectionId = useUIStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useUIStore((s) => s.setActiveCollectionId);

  return {
    activeCollectionId: ctx?.activeCollectionId ?? activeCollectionId,
    setActiveCollectionId: ctx?.setActiveCollectionId ?? setActiveCollectionId,
  };
}

export function ActiveCollectionProvider({ children }: { children: ReactNode }) {
  const activeCollectionId = useUIStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useUIStore((s) => s.setActiveCollectionId);

  return (
    <ActiveCollectionContext.Provider value={{ activeCollectionId, setActiveCollectionId }}>
      {children}
    </ActiveCollectionContext.Provider>
  );
}
