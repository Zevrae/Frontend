'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNavTransition } from '../hooks/useNavTransition';
import { useActiveCollection } from '../features/ActiveCollectionContext';
import winterBanner from '../assets/Zevrae Winter Collection Banner.png';

export function WinterCollectionBanner() {
  const { activeCollectionId } = useActiveCollection();
  const navTransition = useNavTransition();
  const router = useRouter();

  if (activeCollectionId !== 'clothing') {
    return null;
  }

  const handleWomenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navTransition('/women');
  };

  const handleMenClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navTransition('/men');
  };

  return (
    <section
      className="relative w-full bg-[var(--theme-bg)] mt-12 sm:mt-16 md:mt-24 lg:mt-28 border-y border-white/[0.08] overflow-hidden select-none"
      aria-label="Zevrae Winter Collection"
    >
      <div className="relative w-full aspect-[1961/802] mx-auto overflow-hidden">
        {/* Banner Artwork */}
        <Image
          src={winterBanner}
          alt="ZEVRAE Winter Collection — Women & Men"
          fill
          priority
          sizes="100vw"
          className="object-cover w-full h-full pointer-events-none select-none transition-transform duration-700 ease-out"
        />

        {/* Subtle Luxury Gradient Overlays for Ambient Depth */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-black/25 via-transparent to-black/35" />

        {/* 
          Interactive Split Columns:
          - Women: 35% clickable
          - Middle: 30% non-clickable
          - Men: 35% clickable
        */}
        <div className="absolute inset-0 flex w-full h-full z-10">
          {/* ── Women Clickable Area (35%) ── */}
          <Link
            href="/women"
            onClick={handleWomenClick}
            onMouseEnter={() => router.prefetch('/women')}
            aria-label="Explore Women's Winter Collection"
            className="group relative w-[35%] h-full cursor-pointer flex flex-col justify-end items-center pb-3 sm:pb-6 md:pb-8 lg:pb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            {/* Elegant Golden Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-amber-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Floating Luxury Pill CTA */}
            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/90 shadow-lg text-[8px] sm:text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 transform group-hover:-translate-y-1">
              <span>Women</span>
              <svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>

          {/* ── Middle Non-Clickable Area (30%) ── */}
          <div
            className="w-[30%] h-full pointer-events-none cursor-default select-none"
            aria-hidden="true"
          />

          {/* ── Men Clickable Area (35%) ── */}
          <Link
            href="/men"
            onClick={handleMenClick}
            onMouseEnter={() => router.prefetch('/men')}
            aria-label="Explore Men's Winter Collection"
            className="group relative w-[35%] h-full cursor-pointer flex flex-col justify-end items-center pb-3 sm:pb-6 md:pb-8 lg:pb-12 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
          >
            {/* Elegant Golden Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-amber-500/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Floating Luxury Pill CTA */}
            <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 md:px-5 py-1 sm:py-1.5 md:py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white/90 shadow-lg text-[8px] sm:text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] group-hover:bg-white group-hover:text-black group-hover:border-white transition-all duration-300 transform group-hover:-translate-y-1">
              <span>Men</span>
              <svg
                className="w-2.5 h-2.5 sm:w-3 sm:h-3 transform group-hover:translate-x-1 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default WinterCollectionBanner;
