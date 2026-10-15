'use client';

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

export type TransitionPhase = "idle" | "entering" | "holding" | "exiting";

interface PageTransitionState {
  isTransitioning: boolean;
  phase: TransitionPhase;
  /** Start a transition. `callback` fires once the curtain fully covers the screen. */
  trigger: (callback?: () => void) => void;
  /** Called by the loader when animation phases complete */
  setPhase: (phase: TransitionPhase) => void;
}

const PageTransitionContext = createContext<PageTransitionState | null>(null);

/**
 * If a phase hasn't advanced after this long, something went wrong
 * (timeline killed, loader unmounted, etc.) — force back to idle so the
 * full-screen overlay can never lock the UI permanently.
 * Longest normal phase is ~0.85s, so this is very generous.
 */
const WATCHDOG_MS = 4000;

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const callbackRef = useRef<(() => void) | undefined>(undefined);
  const busyRef = useRef(false);

  const forceReset = useCallback(() => {
    busyRef.current = false;
    callbackRef.current = undefined;
    setPhase("idle");
  }, []);

  const trigger = useCallback((callback?: () => void) => {
    if (busyRef.current) return;
    busyRef.current = true;
    callbackRef.current = callback;
    setPhase("entering");
  }, []);

  const setPhaseWrapped = useCallback((p: TransitionPhase) => {
    if (p === "holding") {
      // Curtain fully covers the screen — safe to navigate now.
      // Clear the ref BEFORE calling so a throw can't leave a stale callback.
      const cb = callbackRef.current;
      callbackRef.current = undefined;
      try {
        cb?.();
      } catch (err) {
        console.error("[PageTransition] navigation callback failed:", err);
      }
    }
    if (p === "idle") {
      busyRef.current = false;
      callbackRef.current = undefined;
    }
    setPhase(p);
  }, []);

  // ── Theme change events go through trigger() so they respect busyRef ──────
  useEffect(() => {
    const onThemeChange = () => trigger();
    window.addEventListener("zevrae:theme-change", onThemeChange);
    return () =>
      window.removeEventListener("zevrae:theme-change", onThemeChange);
  }, [trigger]);

  // ── Browser back/forward safety reset ─────────────────────────────────────
  // popstate while a transition is in flight would otherwise leave the overlay
  // blocking clicks. The loader reacts to phase === "idle" and cleans up GSAP.
  useEffect(() => {
    const handlePopstate = () => {
      if (busyRef.current) forceReset();
    };
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, [forceReset]);

  // ── Watchdog: never let a stuck phase lock the UI ─────────────────────────
  useEffect(() => {
    if (phase === "idle") return;
    const t = setTimeout(() => {
      console.warn(`[PageTransition] stuck in "${phase}", forcing reset`);
      forceReset();
    }, WATCHDOG_MS);
    return () => clearTimeout(t);
  }, [phase, forceReset]);

  const value = useMemo(
    () => ({
      isTransitioning: phase !== "idle",
      phase,
      trigger,
      setPhase: setPhaseWrapped,
    }),
    [phase, trigger, setPhaseWrapped],
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