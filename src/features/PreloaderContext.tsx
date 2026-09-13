'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PreloaderState {
  isLoading: boolean;
  hasCompletedOnce: boolean;
  finish: () => void;
}

const PreloaderContext = createContext<PreloaderState | null>(null);

export function PreloaderProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnce, setDone] = useState(false);

  const finish = useCallback(() => {
    setIsLoading(false);
    setDone(true);
  }, []);

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
  if (!ctx) throw new Error("usePreloader must be used within PreloaderProvider");
  return ctx;
}
