'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { useTheme, useSetTheme } from '../theme/ThemeProvider';
import { usePreloader } from '../features/PreloaderContext';
import { usePageTransition } from '../features/PageTransitionContext';
import { useCollectionTransition } from '../features/CollectionTransitionContext';
import { useActiveCollection } from '../features/ActiveCollectionContext';
import HeroCountdown from '../features/HeroCountdown';
import heroImage from '../assets/hero section try.webp';
import jewelleryHeroImage from '../assets/jewellery hero section.webp';
import accessoriesHeroImage from '../assets/accessories hero section.webp';
import type { ThemeName } from '../theme/themeConfig';

interface StorefrontHeroProps {
  isLiveMode?: boolean;
  setIsLiveMode?: (val: boolean) => void;
}

// Mirrors the data shape that CollectionScroller uses — keeps all transition
// params (veilColor, brightness, etc.) in one place so both components stay
// in sync automatically.
interface HeroSlide {
  theme: ThemeName;
  label: string;
  veilColor: string;
  heroImage: any;
  heroBrightness?: number;
  heroVignetteOpacity?: number;
  heroObjectPosition?: string;
}

const SLIDES: HeroSlide[] = [
  {
    theme: 'clothing',
    label: 'Clothing',
    veilColor: '#12100C',
    heroImage,
    // clothing uses :root CSS defaults — no overrides needed
  },
  {
    theme: 'jewellery',
    label: 'Jewellery',
    veilColor: '#FAEAB1',
    heroImage: jewelleryHeroImage,
    heroBrightness: 0.75,
    heroVignetteOpacity: 0.10,
    heroObjectPosition: '30% center',
  },
  {
    theme: 'accessories',
    label: 'Accessories',
    veilColor: '#F5F5F5',
    heroImage: accessoriesHeroImage,
    heroBrightness: 0.75,
    heroVignetteOpacity: 0.10,
    heroObjectPosition: 'center center',
  },
];

/** Apply all CSS custom-property overrides for the given slide —
 *  identical to what CollectionScroller does inside its activeIdx effect. */
function applyHeroCSS(slide: HeroSlide) {
  const root = document.documentElement;

  if (slide.heroBrightness !== undefined) {
    root.style.setProperty('--hero-brightness', String(slide.heroBrightness));
  } else {
    root.style.removeProperty('--hero-brightness');
  }

  if (slide.heroVignetteOpacity !== undefined) {
    root.style.setProperty('--hero-vignette-opacity', String(slide.heroVignetteOpacity));
  } else {
    root.style.removeProperty('--hero-vignette-opacity');
  }

  if (slide.heroObjectPosition) {
    root.style.setProperty('--hero-object-position', slide.heroObjectPosition);
  } else {
    root.style.removeProperty('--hero-object-position');
  }
}

export function StorefrontHero({ isLiveMode = true, setIsLiveMode }: StorefrontHeroProps) {
  const theme = useTheme();
  const setTheme = useSetTheme();
  const { hasCompletedOnce } = usePreloader();
  const { isTransitioning } = usePageTransition();
  const { triggerTransition, isCollectionTransitioning } = useCollectionTransition();
  const { setActiveCollectionId } = useActiveCollection();
  const isAnimating = useRef(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroAnimatedRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const currentIndex = SLIDES.findIndex((s) => s.theme === theme);
  // Guard: if theme doesn't match any slide (e.g. on a category sub-page),
  // clamp to 0 so the arrows still render safely.
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const activeSlide = SLIDES[safeIndex];

  // ── Navigate using the exact same veil system as CollectionScroller ────────
  const goTo = (idx: number) => {
    if (isAnimating.current) return;
    const clamped = (idx + SLIDES.length) % SLIDES.length;
    if (clamped === safeIndex) return;

    isAnimating.current = true;
    const incoming = SLIDES[clamped];

    triggerTransition(() => {
      // Runs while the veil is fully opaque — swap everything here
      setTheme(incoming.theme);
      setActiveCollectionId(incoming.theme);
      applyHeroCSS(incoming);
    }, incoming.veilColor);

    // Release the lock after the veil animation completes (~800ms total)
    setTimeout(() => { isAnimating.current = false; }, 850);
  };

  const handlePrev = () => goTo(safeIndex - 1);
  const handleNext = () => goTo(safeIndex + 1);

  // ── Hero scale pulse during collection transition ──────────────────────────
  useEffect(() => {
    const img = heroImageRef.current;
    if (!img) return;
    if (isCollectionTransitioning) {
      gsap.to(img, { scale: 1.025, duration: 0.32, ease: 'power2.inOut', overwrite: true });
    } else {
      gsap.to(img, { scale: 1, duration: 0.42, ease: 'power2.out', overwrite: true });
    }
  }, [isCollectionTransitioning]);

  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  const HERO_LETTERS = 'ZEVRAE'.split('');
  const HERO_LETTER_ORDER = [3, 0, 5, 1, 4, 2];

  const resetHero = () => {
    if (!heroRef.current) return;
    heroAnimatedRef.current = false;
    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');
    letters.forEach((el) => gsap.set(el, { yPercent: 110 }));
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    if (infoRow) gsap.set(infoRow, { opacity: 0, y: 20 });
  };

  const runHeroAnimation = () => {
    if (!heroRef.current) return;
    if (heroAnimatedRef.current) {
      const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
      letters.forEach((el) => gsap.to(el, { yPercent: 0, duration: 0.3 }));
      return;
    }
    heroAnimatedRef.current = true;

    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');

    if (!letters.length) return;

    const tl = gsap.timeline();

    HERO_LETTER_ORDER.forEach((letterIdx, seqIdx) => {
      if (letters[letterIdx]) {
        tl.to(
          letters[letterIdx],
          { yPercent: 0, duration: 0.9, ease: 'power4.out' },
          `${seqIdx * 0.09}`
        );
      }
    });

    if (line) {
      tl.to(line, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0);
    }

    if (infoRow) {
      tl.to(infoRow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1);
    }
  };

  useEffect(() => {
    if (hasCompletedOnce) {
      runHeroAnimation();
    } else {
      resetHero();
    }
  }, [hasCompletedOnce]);

  useEffect(() => {
    const handleSliding = () => { setTimeout(runHeroAnimation, 350); };
    const handleReveal = () => { setTimeout(runHeroAnimation, 50); };
    window.addEventListener('preloader-sliding', handleSliding);
    window.addEventListener('hero-reveal', handleReveal);
    return () => {
      window.removeEventListener('preloader-sliding', handleSliding);
      window.removeEventListener('hero-reveal', handleReveal);
    };
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative bg-[var(--theme-bg)] overflow-hidden min-h-screen flex flex-col items-center justify-center"
    >
      <Image
        ref={heroImageRef}
        src={typeof activeSlide.heroImage === 'string' ? activeSlide.heroImage : (activeSlide.heroImage as any)?.src || ''}
        alt="ZEVRAE Contemporary Luxury"
        fill
        priority
        sizes="100vw"
        className="object-cover"
        style={{
          filter: 'brightness(var(--hero-brightness)) saturate(1.1)',
          objectPosition: 'var(--hero-object-position)',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      />
      {/* Warm amber vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 60%, rgba(var(--theme-accent-rgb),0.08) 0%, rgba(10,10,10,var(--hero-vignette-opacity)) 70%)',
        }}
      />
      {/* Theme background tint overlay */}
      <div
        className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]"
        style={{
          backgroundColor:
            'rgba(var(--hero-tint-color-rgb, var(--theme-bg-rgb)), var(--hero-tint-opacity, 0))',
          transition: 'background-color 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />

      {/* All hero text */}
      <div className="relative z-10 flex flex-col items-center">
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {/* Giant ZEVRAE — letters slide up via GSAP */}
          <h1
            className="font-archivo font-extrabold uppercase text-[var(--theme-text)] text-center"
            style={{
              fontSize: 'clamp(3rem, 14vw, 18rem)',
              fontStretch: '125%',
              letterSpacing: '-0.02em',
              lineHeight: 0.88,
              margin: 0,
            }}
            aria-label="ZEVRAE"
          >
            {HERO_LETTERS.map((letter, i) => (
              <span
                key={`hero-${letter}-${i}`}
                className="inline-block overflow-hidden"
                style={{ lineHeight: 1 }}
              >
                <span className="zv-hero-letter inline-block" style={{ willChange: 'transform' }}>
                  {letter}
                </span>
              </span>
            ))}
          </h1>

          {/* White line — draws left→right */}
          <div
            className="hero-divider-line"
            style={{
              height: '1.5px',
              background: 'var(--theme-text)',
              width: '100%',
              marginTop: '0.6rem',
            }}
          />

          {/* Tagline */}
          <p
            className="font-serif italic text-[rgba(var(--theme-text-rgb),0.75)] text-center tracking-[0.02em]"
            style={{ fontFamily: '"Playfair Display", ui-serif, Georgia, serif', fontSize: '1.05rem', marginTop: '1.4rem' }}
          >
            Luxury is a Matter of Choice
          </p>

          {/* Countdown embedded directly below quote */}
          {!isLiveMode && setIsLiveMode && (
            <HeroCountdown onLive={() => setIsLiveMode(true)} />
          )}
        </div>
      </div>

      {/* Prev Arrow */}
      <button
        onClick={handlePrev}
        aria-label="Previous collection"
        style={{
          position: 'absolute',
          left: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--theme-text)',
          cursor: 'pointer',
          transition: 'background 0.2s, transform 0.2s',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Next Arrow */}
      <button
        onClick={handleNext}
        aria-label="Next collection"
        style={{
          position: 'absolute',
          right: '1.5rem',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 30,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '3rem',
          height: '3rem',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.3)',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          color: 'var(--theme-text)',
          cursor: 'pointer',
          transition: 'background 0.2s, transform 0.2s',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.18)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)';
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Dot indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 30,
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        {SLIDES.map((s, i) => (
            <button
              key={s.theme}
              onClick={() => goTo(i)}
              aria-label={`Go to ${s.label}`}
              style={{
                width: i === safeIndex ? '1.5rem' : '0.4rem',
                height: '0.4rem',
                borderRadius: '999px',
                background: i === safeIndex ? 'var(--theme-text)' : 'rgba(255,255,255,0.35)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.35s cubic-bezier(0.22,1,0.36,1), background 0.35s',
                outline: 'none',
              }}
            />
          ))}
      </div>
    </section>
  );
}
