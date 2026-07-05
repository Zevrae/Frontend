import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface PageTransitionState {
  isTransitioning: boolean;
  trigger: (callback?: () => void) => void;
}

const PageTransitionContext = createContext<PageTransitionState | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  const trigger = useCallback((callback?: () => void) => {
    // Guard: don't double-trigger
    setIsTransitioning((prev) => {
      if (prev) return prev;
      return true;
    });

    // Fire nav callback when curtain is fully in (~500ms)
    setTimeout(() => {
      callback?.();
    }, 480);

    // Remove curtain (exit animation plays ~550ms)
    setTimeout(() => {
      setIsTransitioning(false);
    }, 950);
  }, []);

  const value = useMemo(
    () => ({ isTransitioning, trigger }),
    [isTransitioning, trigger]
  );

  return (
    <PageTransitionContext.Provider value={value}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function usePageTransition(): PageTransitionState {
  const ctx = useContext(PageTransitionContext);
  if (!ctx)
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider"
    );
  return ctx;
}
