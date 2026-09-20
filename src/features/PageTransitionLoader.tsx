'use client';

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { usePageTransition } from "./PageTransitionContext";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BRAND_LETTERS = "ZEVRAE".split("");
const LETTER_ORDER = [3, 0, 5, 1, 4, 2];

/**
 * PageTransitionLoader — Luxury gold curtain transition.
 * Handles both page-to-page navigation and theme change transitions.
 */
export function PageTransitionLoader() {
  const [mounted, setMounted] = useState(false);
  const { phase, setPhase } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  // Separate ref for the holding delayedCall so ctx.revert() doesn't kill it
  const holdingTimerRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── LISTEN FOR THEME CHANGE EVENTS ───
  useEffect(() => {
    const handleThemeChangeTrigger = () => {
      // Only trigger if currently idle
      if (phase === "idle") {
        setPhase("entering");
      }
    };

    window.addEventListener("zevrae:theme-change", handleThemeChangeTrigger);
    return () => {
      window.removeEventListener("zevrae:theme-change", handleThemeChangeTrigger);
    };
  }, [phase, setPhase]);

  // ── Browser back/forward: clean up GSAP immediately ───────────────────────
  // If the browser navigates (popstate) while a curtain animation is running,
  // GSAP inline styles (opacity:0, y:-60) may be left on [data-page-content],
  // making the newly-rendered page invisible. Kill the timeline and clear all
  // props so the incoming route renders at full visibility.
  useEffect(() => {
    const handlePopstate = () => {
      tlRef.current?.kill();
      tlRef.current = null;
      holdingTimerRef.current?.kill();
      holdingTimerRef.current = null;
      const pageContent = document.querySelector<HTMLElement>("[data-page-content]");
      if (pageContent) {
        gsap.set(pageContent, { clearProps: "y,opacity,transform" });
      }
      // Also hide the curtain overlay immediately
      if (curtainRef.current) {
        gsap.set(curtainRef.current, { yPercent: 100 });
      }
    };
    window.addEventListener("popstate", handlePopstate);
    return () => window.removeEventListener("popstate", handlePopstate);
  }, []);

  useIsoLayoutEffect(() => {
    if (phase === "idle" || !rootRef.current || !curtainRef.current) return;

    const ctx = gsap.context(() => {
      const letters = gsap.utils.toArray<HTMLElement>(".zv-trans-letter");
      const pageContent = document.querySelector<HTMLElement>(
        "[data-page-content]",
      );

      if (phase === "entering") {
        // Kill any existing timeline
        tlRef.current?.kill();

        // Pre-position
        gsap.set(curtainRef.current, { yPercent: 100, opacity: 1, force3D: true });
        letters.forEach((el) => gsap.set(el, { yPercent: 120, force3D: true }));

        const tl = gsap.timeline({
          onComplete: () => setPhase("holding"),
        });
        tlRef.current = tl;

        // Curtain slides up from bottom
        tl.to(curtainRef.current, {
          yPercent: 0,
          duration: 0.45,
          ease: "power2.inOut",
          force3D: true,
        });

        // Simultaneously push page content up + fade
        if (pageContent) {
          tl.to(
            pageContent,
            {
              y: -40,
              opacity: 0,
              duration: 0.35,
              ease: "power2.inOut",
              force3D: true,
            },
            0,
          );
        }

        // At ~70% of the curtain animation, start letters
        LETTER_ORDER.forEach((letterIdx, seqIdx) => {
          tl.to(
            letters[letterIdx],
            {
              yPercent: 0,
              duration: 0.28,
              ease: "expo.out",
              force3D: true,
            },
            `${0.28 + seqIdx * 0.03}`,
          );
        });
      }

      if (phase === "holding") {
        tlRef.current?.kill();
        // Kill any previous holding timer
        holdingTimerRef.current?.kill();
        holdingTimerRef.current = null;
        // Use gsap.delayedCall OUTSIDE the context so ctx.revert() on the next
        // phase change doesn't kill it before the 0.25 s hold finishes.
        // An empty timeline with only a `delay` has totalDuration=0 and fires
        // onComplete immediately — delayedCall is the correct primitive here.
        holdingTimerRef.current = gsap.delayedCall(0.1, () => {
          holdingTimerRef.current = null;
          setPhase("exiting");
        });
      }

      if (phase === "exiting") {
        tlRef.current?.kill();

        const tl = gsap.timeline({
          onComplete: () => {
            if (pageContent) {
              gsap.set(pageContent, {
                clearProps: "y,opacity,transform",
              });
            }
            setPhase("idle");
          },
        });
        tlRef.current = tl;

        // Letters exit upward first
        const reverseOrder = [...LETTER_ORDER].reverse();
        reverseOrder.forEach((letterIdx, seqIdx) => {
          tl.to(
            letters[letterIdx],
            {
              yPercent: -120,
              duration: 0.22,
              ease: "expo.in",
              force3D: true,
            },
            seqIdx * 0.02,
          );
        });

        // Curtain exits upward
        tl.to(
          curtainRef.current,
          {
            yPercent: -100,
            duration: 0.4,
            ease: "power2.inOut",
            force3D: true,
            onStart: () => {
              window.dispatchEvent(new CustomEvent("hero-reveal"));
              window.dispatchEvent(new CustomEvent("zevrae:page-reveal"));
            },
          },
          0.25,
        );

        // Fade page content back in from slightly below
        if (pageContent) {
          tl.fromTo(
            pageContent,
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.35,
              ease: "power2.out",
              force3D: true,
            },
            0.35,
          );
        }
      }
    }, rootRef);

    return () => {
      ctx.revert();
      // If leaving the holding phase (e.g. component unmounts mid-hold), clean up the timer
      if (phase === "holding") {
        holdingTimerRef.current?.kill();
        holdingTimerRef.current = null;
      }
    };
  }, [phase, setPhase]);

  const isVisible = phase !== "idle";
  // Block pointer events for the full duration of every non-idle phase:
  // "entering"  — curtain sliding up (0.85 s)
  // "holding"   — curtain fully covering screen (0.25 s delay)
  // "exiting"   — curtain sweeping away upward (0.75 s)
  //
  // Previously only entering+holding were blocked. Allowing clicks during
  // "exiting" caused a second navTransition to race the active GSAP timeline,
  // leaving page content invisible / partially animated (the "messy" glitch).
  const blockPointer = phase !== "idle";

  if (!mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: blockPointer ? "auto" : "none",
        visibility: isVisible ? "visible" : "hidden",
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
          transform: "translateZ(0)",
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