'use client';

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useUIStore } from "../store/uiStore";

export interface PreloaderState {
  isLoading: boolean;
  hasCompletedOnce: boolean;
  finish: () => void;
}

const PreloaderContext = createContext<PreloaderState | null>(null);

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const isLoading = useUIStore((s) => s.isPreloaderLoading);
  const hasCompletedOnce = useUIStore((s) => s.hasPreloaderCompletedOnce);
  const finish = useUIStore((s) => s.finishPreloader);

  const value = useMemo(
    () => ({ isLoading, hasCompletedOnce, finish }),
    [isLoading, hasCompletedOnce, finish],
  );

  return (
    <PreloaderContext.Provider value={value}>
      {children}
    </PreloaderContext.Provider>
  );
}

export function usePreloader(): PreloaderState {
  const ctx = useContext(PreloaderContext);
  if (ctx) return ctx;
  const store = useUIStore.getState();
  return {
    isLoading: store.isPreloaderLoading,
    hasCompletedOnce: store.hasPreloaderCompletedOnce,
    finish: store.finishPreloader,
  };
}
