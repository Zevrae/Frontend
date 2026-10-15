'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { usePageTransition } from "./PageTransitionContext";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BRAND_LETTERS = "ZEVRAE".split("");
const LETTER_ORDER = [3, 0, 5, 1, 4, 2];
const CLEAR_PROPS = "y,opacity,transform";

/** Always query fresh — the route swap may replace this DOM node. */
const getPageContent = () =>
  document.querySelector<HTMLElement>("[data-page-content]");

/**
 * PageTransitionLoader — Luxury gold curtain transition.
 * Handles both page-to-page navigation and theme change transitions.
 *
 * The phase is owned by PageTransitionContext. This component only plays
 * the animation for the current phase and reports back when it finishes.
 */
export function PageTransitionLoader() {
  const [mounted, setMounted] = useState(false);
  const { phase, setPhase } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const holdingTimerRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useIsoLayoutEffect(() => {
    // Wait for the portal to exist. `mounted` is a dep so a transition that
    // was triggered before mount still plays once the portal is ready.
    if (!mounted) return;
    const root = rootRef.current;
    const curtain = curtainRef.current;
    if (!root || !curtain) return;

    const killAll = () => {
      tlRef.current?.kill();
      tlRef.current = null;
      holdingTimerRef.current?.kill();
      holdingTimerRef.current = null;
    };

    const letters = Array.from(
      root.querySelectorAll<HTMLElement>(".zv-trans-letter"),
    );

    // ── IDLE: park the curtain and make sure the page is fully visible ─────
    // This also covers forced resets (popstate / watchdog) from the context.
    if (phase === "idle") {
      killAll();
      gsap.set(curtain, { yPercent: 100, force3D: true });
      const pc = getPageContent();
      if (pc) gsap.set(pc, { clearProps: CLEAR_PROPS });
      return;
    }

    // ── ENTERING: curtain slides up, page content lifts away ───────────────
    if (phase === "entering") {
      killAll();

      gsap.set(curtain, { yPercent: 100, opacity: 1, force3D: true });
      gsap.set(letters, { yPercent: 120, force3D: true });

      const tl = gsap.timeline({ onComplete: () => setPhase("holding") });
      tlRef.current = tl;

      tl.to(curtain, {
        yPercent: 0,
        duration: 0.85,
        ease: "power3.inOut",
        force3D: true,
      });

      const pageContent = getPageContent();
      if (pageContent) {
        tl.to(
          pageContent,
          {
            y: -40,
            opacity: 0,
            duration: 0.75,
            ease: "power2.inOut",
            force3D: true,
          },
          0,
        );
      }

      LETTER_ORDER.forEach((letterIdx, seqIdx) => {
        tl.to(
          letters[letterIdx],
          {
            yPercent: 0,
            duration: 0.38,
            ease: "expo.out",
            force3D: true,
          },
          0.28 + seqIdx * 0.03,
        );
      });
    }

    // ── HOLDING: brief pause so the brand is visible ───────────────────────
    // (the navigation callback has already been fired by the context)
    if (phase === "holding") {
      killAll();
      holdingTimerRef.current = gsap.delayedCall(0.25, () => {
        holdingTimerRef.current = null;
        setPhase("exiting");
      });
    }

    // ── EXITING: letters leave, curtain lifts, new page fades in ───────────
    if (phase === "exiting") {
      killAll();

      const tl = gsap.timeline({
        onComplete: () => {
          // Re-query: the node may have been replaced during navigation.
          const pc = getPageContent();
          if (pc) gsap.set(pc, { clearProps: CLEAR_PROPS });
          setPhase("idle");
        },
      });
      tlRef.current = tl;

      [...LETTER_ORDER].reverse().forEach((letterIdx, seqIdx) => {
        tl.to(
          letters[letterIdx],
          {
            yPercent: -120,
            duration: 0.28,
            ease: "expo.in",
            force3D: true,
          },
          seqIdx * 0.02,
        );
      });

      tl.to(
        curtain,
        {
          yPercent: -100,
          duration: 0.75,
          ease: "power3.inOut",
          force3D: true,
          onStart: () => {
            window.dispatchEvent(new CustomEvent("hero-reveal"));
            window.dispatchEvent(new CustomEvent("zevrae:page-reveal"));
          },
        },
        0.25,
      );

      const pageContent = getPageContent();
      if (pageContent) {
        tl.fromTo(
          pageContent,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: "power2.out",
            force3D: true,
          },
          0.35,
        );
      }
    }

    // Stop running tweens when the phase changes or the component unmounts.
    // Deliberately NOT revert(): reverting would snap every element back to its
    // pre-animation style between phases and cause flashes / jumps.
    return () => {
      killAll();
    };
  }, [phase, mounted, setPhase]);

  // Safety net: if the loader unmounts mid-transition, never leave inline
  // GSAP styles on the page content.
  useEffect(() => {
    return () => {
      const pc = getPageContent();
      if (pc) gsap.set(pc, { clearProps: CLEAR_PROPS });
    };
  }, []);

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  const isActive = phase !== "idle";

  return createPortal(
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        // Block clicks for every non-idle phase so a second navigation can't
        // race the active timeline.
        pointerEvents: isActive ? "auto" : "none",
        visibility: isActive ? "visible" : "hidden",
      }}
      aria-hidden="true"
    >
      <div
        ref={curtainRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "var(--theme-accent)",
          willChange: "transform",
          backfaceVisibility: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 0,
            position: "relative",
          }}
        >
          {BRAND_LETTERS.map((letter, i) => (
            <span
              key={`${letter}-${i}`}
              style={{
                display: "inline-block",
                overflow: "hidden",
                lineHeight: 1,
              }}
            >
              <span
                className="zv-trans-letter"
                style={{
                  display: "inline-block",
                  fontFamily: "'Archivo', sans-serif",
                  fontSize: "clamp(1.6rem, 4.5vw, 3.5rem)",
                  fontWeight: 700,
                  fontStretch: "125%",
                  letterSpacing: "0.03em",
                  color: "var(--theme-bg)",
                  lineHeight: 1,
                  textTransform: "uppercase",
                  willChange: "transform",
                }}
              >
                {letter}
              </span>
            </span>
          ))}
          <span
            style={{
              position: "absolute",
              top: "-0.1em",
              right: "-1.5em",
              fontFamily: "'Archivo', sans-serif",
              fontSize: "clamp(0.45rem, 1.2vw, 0.75rem)",
              fontWeight: 500,
              color: "var(--theme-bg)",
              letterSpacing: "0.05em",
              lineHeight: 1,
              opacity: 0.6,
            }}
          >
            TM
          </span>
        </div>
      </div>
    </div>,
    document.body,
  );
}