'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useTheme } from '../theme/ThemeProvider';
import { usePreloader } from '../features/PreloaderContext';
import { usePageTransition } from '../features/PageTransitionContext';
import { useCollectionTransition } from '../features/CollectionTransitionContext';
import HeroCountdown from '../features/HeroCountdown';
import heroImage from '../assets/hero section try.webp';
import jewelleryHeroImage from '../assets/jewellery hero section.webp';
import accessoriesHeroImage from '../assets/accessories hero section.webp';

interface StorefrontHeroProps {
  isLiveMode?: boolean;
  setIsLiveMode?: (val: boolean) => void;
}

export function StorefrontHero({ isLiveMode = true, setIsLiveMode }: StorefrontHeroProps) {
  const theme = useTheme();
  const { hasCompletedOnce } = usePreloader();
  const { isTransitioning } = usePageTransition();
  const { isCollectionTransitioning } = useCollectionTransition();

  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroAnimatedRef = useRef(false);
  const isTransitioningRef = useRef(false);

  const activeHeroImage =
    theme === 'jewellery'
      ? jewelleryHeroImage
      : theme === 'accessories'
      ? accessoriesHeroImage
      : heroImage;

  // Hero scale pulse during collection transition
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
    if (heroAnimatedRef.current || !heroRef.current) return;
    heroAnimatedRef.current = true;

    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');

    if (!letters.length) return;

    const tl = gsap.timeline();

    HERO_LETTER_ORDER.forEach((letterIdx, seqIdx) => {
      tl.to(
        letters[letterIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`
      );
    });

    if (line) {
      tl.to(line, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0);
    }

    if (infoRow) {
      tl.to(infoRow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1);
    }
  };

  useEffect(() => {
    resetHero();
    if (hasCompletedOnce && !isTransitioningRef.current) {
      setTimeout(runHeroAnimation, 50);
    }
  }, [hasCompletedOnce]);

  useEffect(() => {
    const handle = () => {
      setTimeout(runHeroAnimation, 500);
    };
    window.addEventListener('preloader-sliding', handle);
    return () => window.removeEventListener('preloader-sliding', handle);
  }, []);

  useEffect(() => {
    const handle = () => {
      setTimeout(runHeroAnimation, 100);
    };
    window.addEventListener('hero-reveal', handle);
    return () => window.removeEventListener('hero-reveal', handle);
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative bg-[var(--theme-bg)] overflow-hidden min-h-screen flex flex-col items-center justify-center"
    >
      <img
        ref={heroImageRef}
        src={typeof activeHeroImage === 'string' ? activeHeroImage : (activeHeroImage as any)?.src || ''}
        alt="ZEVRAE Contemporary Luxury"
        fetchPriority="high"
        decoding="sync"
        className="absolute inset-0 w-full h-full object-cover"
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
            className="font-sans italic text-[rgba(var(--theme-text-rgb),0.6)] text-center"
            style={{ fontSize: '0.9rem', marginTop: '1.4rem', letterSpacing: '0.01em' }}
          >
            Luxury is a Matter of Choice
          </p>

          {/* Countdown embedded directly below quote */}
          {!isLiveMode && setIsLiveMode && (
            <HeroCountdown onLive={() => setIsLiveMode(true)} />
          )}
        </div>
      </div>
    </section>
  );
}
