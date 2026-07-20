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
 *
 * Animation sequence:
 *  1. ENTER: #C5A059 curtain slides up from bottom, pushing page content
 *     up & shrinking it. When curtain is ~70% covering, ZEVRAE text
 *     slides in letter-by-letter (preloader style).
 *  2. HOLD: Brief pause with full gold curtain + text.
 *  3. EXIT: Curtain slides up and out (bottom edge lifts towards top),
 *     letters exit upward, revealing the new page beneath.
 */
export function PageTransitionLoader() {
  const { phase, setPhase } = usePageTransition();
  const rootRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

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

        // Simultaneously push page content up + fade (no scale — avoids full-page repaint)
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
            0, // start at the same time
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
        // Brief hold, then exit
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
            // Reset page content
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

        // Curtain exits upward — bottom edge lifts to top
        // This creates the "peeling away upward" feeling
        tl.to(
          curtainRef.current,
          {
            yPercent: -100,
            duration: 0.75,
            ease: "power2.inOut",
            force3D: true,
            onStart: () => {
              // Signal hero to animate in if navigating to home
              window.dispatchEvent(new CustomEvent("hero-reveal"));
              // Generic signal: the curtain is now peeling away and the page
              // beneath is becoming visible. Any page can listen for this to
              // time its own entrance animation off actual visibility instead
              // of its own mount time (which happens earlier, while still
              // fully hidden behind the curtain).
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

  // Always render the portal DOM (hidden when idle via opacity/pointer-events)
  const isVisible = phase !== "idle";

  return createPortal(
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: isVisible ? "auto" : "none",
        visibility: isVisible ? "visible" : "hidden",
      }}
      aria-hidden="true"
    >
      {/* Gold curtain */}
      <div
        ref={curtainRef}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#C5A059",
          willChange: "transform",
          backfaceVisibility: "hidden",
          transform: "translateZ(0)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Brand text — letter-by-letter animation (preloader style) */}
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
                  color: "#12100C",
                  lineHeight: 1,
                  textTransform: "uppercase",
                  willChange: "transform",
                }}
              >
                {letter}
              </span>
            </span>
          ))}
          {/* TM superscript */}
          <span
            style={{
              position: "absolute",
              top: "-0.1em",
              right: "-1.5em",
              fontFamily: "'Archivo', sans-serif",
              fontSize: "clamp(0.45rem, 1.2vw, 0.75rem)",
              fontWeight: 500,
              color: "#12100C",
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