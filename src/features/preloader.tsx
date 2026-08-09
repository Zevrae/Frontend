import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { usePreloader } from "./PreloaderContext";

// Editorial images for the preloader pile
import ed01 from "@/src/assets/ed-01.jpg";
import ed02 from "@/src/assets/ed-02.jpg";
import ed03 from "@/src/assets/ed-03.jpg";
import ed04 from "@/src/assets/ed-04.jpg";
import ed05 from "@/src/assets/ed-05.jpg";
import ed06 from "@/src/assets/ed-06.jpg";

/**
 * Zevrae — OUTFIT-style Preloader with slide-up reveal.
 *
 * Sequence:
 *  1. Dark background. Small editorial photos pile near center.
 *  2. Large "ZEVRAE" text overlays with mix-blend-mode: difference.
 *     Letters slide in from top at random stagger.
 *  3. Counter 000 → 100.
 *  4. REVERSE — letters up, images out, counter fades.
 *  5. Entire preloader slides UP to reveal the hero beneath.
 */

const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

interface EditorialImage {
  id: string;
  url: string;
}

const STACK: EditorialImage[] = [
  { id: "ed-01", url: ed01 },
  { id: "ed-02", url: ed02 },
  { id: "ed-03", url: ed03 },
  { id: "ed-04", url: ed04 },
  { id: "ed-05", url: ed05 },
  { id: "ed-06", url: ed06 },
];
const BRAND_LETTERS = "ZEVRAE".split("");
const LETTER_ORDER = [3, 0, 5, 1, 4, 2];

export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const { finish } = usePreloader();
  const finishedRef = useRef(false);
  const [done, setDone] = useState(false);

  useIsoLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    document.body.setAttribute("data-loading", "true");

    const images = root.querySelectorAll<HTMLElement>(".zv-plimg");
    const letters = root.querySelectorAll<HTMLElement>(".zv-brand-letter");
    const counter = { value: 0 };

    // ── Pre-position images ──
    images.forEach((el, i) => {
      const rot = -8 + i * 7;
      const dx = -12 + i * 5;
      const dy = -6 + i * 3;
      gsap.set(el, {
        rotate: rot,
        x: dx,
        y: dy,
        scale: 0.5,
        opacity: 0,
        transformOrigin: "50% 60%",
      });
    });

    // ── Pre-position letters: below their mask (overflow:hidden parent) ──
    letters.forEach((el) => {
      gsap.set(el, { yPercent: 110 });
    });

    gsap.set(counterRef.current, { opacity: 0 });

    // ═══════════════════════════════
    //  MAIN TIMELINE
    // ═══════════════════════════════
    const tl = gsap.timeline();

    // Counter fade in
    tl.to(counterRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out",
    });

    // Counter 0 → 100
    tl.to(
      counter,
      {
        value: 100,
        duration: 2.2,
        ease: "expo.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = Math.floor(counter.value)
              .toString()
              .padStart(3, "0");
          }
        },
      },
      "<",
    );

    // Images stack in
    tl.to(
      images,
      {
        opacity: 1,
        scale: 1,
        duration: 0.45,
        ease: "back.out(1.2)",
        stagger: { each: 0.18, from: "start" },
      },
      "<",
    );

    // Brand letters slide up into view from below their mask
    LETTER_ORDER.forEach((letterIdx, seqIdx) => {
      tl.to(
        letters[letterIdx],
        {
          yPercent: 0,
          duration: 0.4,
          ease: "expo.out",
        },
        `${0.9 + seqIdx * 0.07}`,
      );
    });

    // Hold
    tl.to({}, { duration: 0.45 });

    // ═══════════════════════════════
    //  REVERSE + MORPH
    // ═══════════════════════════════

    // Letters slide up and out through the top of their mask
    const reverseOrder = [...LETTER_ORDER].reverse();
    reverseOrder.forEach((letterIdx, seqIdx) => {
      tl.to(
        letters[letterIdx],
        {
          yPercent: -110,
          duration: 0.3,
          ease: "expo.in",
        },
        seqIdx === 0 ? "rev" : `rev+=${seqIdx * 0.04}`,
      );
    });

    // Images dismount
    tl.to(
      images,
      {
        opacity: 0,
        scale: 0.35,
        y: "+=40",
        duration: 0.4,
        ease: "power3.in",
        stagger: { each: 0.04, from: "end" },
      },
      "rev+=0.1",
    );

    // Counter out
    tl.to(
      counterRef.current,
      { opacity: 0, duration: 0.3, ease: "power2.in" },
      "-=0.25",
    );

    // ── Slide the ENTIRE preloader root UP to reveal the hero beneath ──
    tl.to(
      root,
      {
        yPercent: -100,
        duration: 1.0,
        ease: "power3.inOut",
        onStart: () => {
          // Dispatch event so hero can start animating while slide is in progress
          window.dispatchEvent(new CustomEvent("preloader-sliding"));
        },
        onComplete: () => {
          // Only now signal context + unmount
          if (finishedRef.current) return;
          finishedRef.current = true;
          document.body.setAttribute("data-loading", "false");
          finish();
          setDone(true);
        },
      },
      "-=0.1",
    );

    return () => {
      tl.kill();
      document.body.setAttribute("data-loading", "false");
    };
  }, [finish]);

  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--theme-bg)" }}
      >
        {/* ── Central stage ── */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Image pile */}
          <div className="relative w-[min(28vw,220px)] aspect-[3/4]">
            {STACK.map((image, i) => (
              <img
                key={image.id}
                src={image.url}
                alt=""
                className="zv-plimg absolute inset-0 h-full w-full object-cover shadow-[0_16px_50px_-12px_rgba(0,0,0,0.6)]"
                style={{ zIndex: 10 + i }}
                draggable={false}
              />
            ))}
          </div>

          {/* Brand text — mix-blend-mode: difference */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            style={{ zIndex: 30, mixBlendMode: "difference" }}
          >
            <div className="flex items-baseline select-none" style={{ gap: "0" }}>
              {BRAND_LETTERS.map((letter, i) => (
                <span
                  key={`${letter}-${i}`}
                  className="inline-block overflow-hidden"
                  style={{ lineHeight: 1 }}
                >
                  <span
                    className="zv-brand-letter inline-block"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: "clamp(3.5rem, 11vw, 9rem)",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "var(--theme-text)",
                      lineHeight: 1,
                      textTransform: "uppercase",
                      willChange: "transform",
                    }}
                  >
                    {letter}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Counter */}
          <div
            className="absolute"
            style={{
              zIndex: 31,
              right: "calc(50% - min(16vw, 130px) - 3rem)",
              top: "calc(50% - min(21vw, 165px) * 0.55)",
            }}
          >
            <span
              ref={counterRef}
              className="tabular-nums text-[12px] tracking-[0.25em]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "rgba(var(--theme-text-rgb),0.5)",
              }}
            >
              000
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
