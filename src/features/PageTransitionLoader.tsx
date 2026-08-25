import { useEffect, useLayoutEffect, useRef } from "react";
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
  const { phase, setPhase } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

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
          duration: 0.85,
          ease: "power2.inOut",
          force3D: true,
        });

        // Simultaneously push page content up + fade
        if (pageContent) {
          tl.to(
            pageContent,
            {
              y: -60,
              opacity: 0,
              duration: 0.7,
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
              duration: 0.5,
              ease: "expo.out",
              force3D: true,
            },
            `${0.55 + seqIdx * 0.05}`,
          );
        });
      }

      if (phase === "holding") {
        tlRef.current?.kill();

        const tl = gsap.timeline({
          delay: 0.25,
          onComplete: () => setPhase("exiting"),
        });
        tlRef.current = tl;
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
              duration: 0.38,
              ease: "expo.in",
              force3D: true,
            },
            seqIdx * 0.03,
          );
        });

        // Curtain exits upward
        tl.to(
          curtainRef.current,
          {
            yPercent: -100,
            duration: 0.75,
            ease: "power2.inOut",
            force3D: true,
            onStart: () => {
              window.dispatchEvent(new CustomEvent("hero-reveal"));
              window.dispatchEvent(new CustomEvent("zevrae:page-reveal"));
            },
          },
          0.45,
        );

        // Fade page content back in from slightly below
        if (pageContent) {
          tl.fromTo(
            pageContent,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.5,
              ease: "power2.out",
              force3D: true,
            },
            0.65,
          );
        }
      }
    }, rootRef);

    return () => ctx.revert();
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