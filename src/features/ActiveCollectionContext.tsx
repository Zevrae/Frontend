'use client';

import {
  createContext,
  useContext,
  useMemo,
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

const ActiveCollectionContext = createContext<ActiveCollectionContextValue | null>(null);

export function ActiveCollectionProvider({ children }: { children: ReactNode }) {
  const activeCollectionId = useUIStore((s) => s.activeCollectionId);
  const setActiveCollectionId = useUIStore((s) => s.setActiveCollectionId);

  const value = useMemo(
    () => ({ activeCollectionId, setActiveCollectionId }),
    [activeCollectionId, setActiveCollectionId]
  );

  return (
    <ActiveCollectionContext.Provider value={value}>
      {children}
    </ActiveCollectionContext.Provider>
  );
}

export function useActiveCollection(): ActiveCollectionContextValue {
  const ctx = useContext(ActiveCollectionContext);
  if (ctx) return ctx;
  const store = useUIStore.getState();
  return {
    activeCollectionId: store.activeCollectionId,
    setActiveCollectionId: store.setActiveCollectionId,
  };
}
