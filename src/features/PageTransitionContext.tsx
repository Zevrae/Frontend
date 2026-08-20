import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type TransitionPhase = "idle" | "entering" | "holding" | "exiting";

interface PageTransitionState {
  isTransitioning: boolean;
  phase: TransitionPhase;
  trigger: (callback?: () => void) => void;
  /** Called by the loader when animation phases complete */
  setPhase: (phase: TransitionPhase) => void;
}

const PageTransitionContext = createContext<PageTransitionState | null>(null);

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const callbackRef = useRef<(() => void) | undefined>(undefined);
  const busyRef = useRef(false);

  const trigger = useCallback((callback?: () => void) => {
    if (busyRef.current) return;
    busyRef.current = true;
    callbackRef.current = callback;
    setPhase("entering");
  }, []);

  const setPhaseWrapped = useCallback((p: TransitionPhase) => {
    setPhase(p);
    if (p === "holding") {
      // Fire navigation callback when curtain fully covers
      callbackRef.current?.();
      callbackRef.current = undefined;
    }
    if (p === "idle") {
      busyRef.current = false;
    }
  }, []);

  const isTransitioning = phase !== "idle";

  // ── Browser back/forward safety reset ─────────────────────────────────────
  // When the user presses the browser back/forward button or calls navigate(-1),
  // React Router updates the URL via popstate. If a transition was in flight
  // (busyRef=true, phase≠idle), the curtain overlay stays up blocking all clicks.
  // Force-resetting here prevents that permanent lock-out.
  useEffect(() => {
    const handlePopstate = () => {
      if (busyRef.current || phase !== "idle") {
        busyRef.current = false;
        callbackRef.current = undefined;
        setPhase("idle");
      }
    };
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [phase]);

  const value = useMemo(
    () => ({ isTransitioning, phase, trigger, setPhase: setPhaseWrapped }),
    [isTransitioning, phase, trigger, setPhaseWrapped],
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
      "usePageTransition must be used within PageTransitionProvider",
    );
  return ctx;
}
