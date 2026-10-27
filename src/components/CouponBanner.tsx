'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Check, Copy, ArrowDown } from 'lucide-react';
import couponImg from '../assets/coupon.webp';

export function CouponBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText('ZEV15').catch(() => {
      // Fallback if clipboard API is restricted
      const el = document.createElement('textarea');
      el.value = 'ZEV15';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });

    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2500);
  }, []);

  const handleShopNow = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy coupon automatically on shop now click as a helpful gesture
    handleCopy();

    const target = document.getElementById('best-sellers');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }, [handleCopy]);

  return (
    <section
      className="relative w-full py-10 sm:py-14 md:py-20 bg-[var(--theme-bg)] border-y border-white/[0.06] overflow-hidden select-none transition-colors duration-700"
      aria-label="Special Offer Voucher"
    >
      {/* Ambient luxury radial glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-40"
        aria-hidden="true"
      >
        <div className="w-[600px] h-[300px] md:w-[900px] md:h-[400px] rounded-full bg-gradient-to-r from-amber-500/10 via-yellow-200/5 to-amber-500/10 blur-[100px]" />
      </div>

      <div className="relative max-w-[1100px] mx-auto px-4 sm:px-6 md:px-8 flex flex-col items-center">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#daa520] animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-mono tracking-[0.25em] uppercase text-[rgba(var(--theme-text-rgb),0.75)]">
            Exclusive Welcome Privilege
          </span>
        </div>

        {/* Voucher Ticket Card */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => handleCopy()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCopy();
            }
          }}
          aria-label="Coupon code ZEV15 - Click to copy"
          className="group relative w-full aspect-[2172/724] max-w-[1050px] cursor-pointer rounded-2xl transition-all duration-500 ease-out hover:scale-[1.01] hover:-translate-y-0.5 filter drop-shadow-[0_12px_30px_rgba(0,0,0,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#daa520]/60"
        >
          {/* Ticket Image */}
          <Image
            src={couponImg}
            alt="ZEVRAE Voucher — Flat 15% Off with code ZEV15"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1050px"
            className="object-contain w-full h-full pointer-events-none select-none transition-transform duration-500"
          />

          {/* Interactive hotspot over 'SHOP NOW' area on right side of ticket */}
          <button
            type="button"
            onClick={handleShopNow}
            title="Shop Best Sellers with code ZEV15"
            aria-label="Shop Best Sellers with code ZEV15"
            className="absolute right-[10%] bottom-[20%] w-[24%] h-[26%] rounded-lg cursor-pointer bg-transparent hover:bg-black/5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-black/40"
          />

          {/* Luxury Hover Overlay Cue */}
          <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="px-4 py-2 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-mono tracking-[0.2em] uppercase shadow-2xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <Copy className="w-3.5 h-3.5 text-[#daa520]" />
              <span>Click To Copy Code: <strong className="text-[#daa520]">ZEV15</strong></span>
            </div>
          </div>

          {/* Copied Toast Banner inside card */}
          {copied && (
            <div className="absolute inset-x-0 bottom-4 sm:bottom-6 flex justify-center pointer-events-none z-20 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="px-4 py-2 rounded-full bg-black/90 backdrop-blur-md border border-[#daa520]/60 text-white shadow-2xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] sm:text-xs font-mono tracking-widest uppercase font-semibold">
                  Code <span className="text-[#daa520]">ZEV15</span> Copied!
                </span>
                <span className="text-[10px] sm:text-[11px] text-white/70 font-mono hidden sm:inline">
                  (15% off at checkout)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls & Subtext */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 text-[10px] sm:text-xs font-mono uppercase tracking-[0.18em] text-[rgba(var(--theme-text-rgb),0.6)]">
          <span className="hidden sm:inline">Flat 15% discount on your first order</span>
          <span className="hidden sm:inline text-white/20">•</span>
          
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-[#daa520]/15 hover:border-[#daa520]/40 text-[var(--theme-text)] transition-all duration-300 cursor-pointer active:scale-95"
            aria-label="Copy coupon code ZEV15"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">ZEV15 Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#daa520]" />
                <span>Copy Code <span className="text-[#daa520] font-semibold">ZEV15</span></span>
              </>
            )}
          </button>

          <span className="text-white/20">•</span>

          <button
            type="button"
            onClick={handleShopNow}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-[var(--theme-text)] transition-all duration-300 cursor-pointer active:scale-95"
            aria-label="Scroll to Best Sellers"
          >
            <span>Explore Best Sellers</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CouponBanner;
