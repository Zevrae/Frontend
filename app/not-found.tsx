'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex flex-col items-center justify-center p-6 font-sans">
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 mix-blend-difference"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-md space-y-6"
      >
        <p className="text-[11px] font-plex-mono uppercase tracking-[0.5em] text-[var(--theme-accent)]">
          404 — Page Not Found
        </p>
        <h1 className="text-3xl md:text-4xl font-archivo font-bold tracking-[0.1em] uppercase text-[var(--theme-text)]">
          Lost in Luxury
        </h1>
        <p className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] leading-relaxed tracking-wider">
          The page you are looking for does not exist or has been relocated.
        </p>
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all rounded-sm uppercase"
          >
            <ArrowLeft size={14} /> Return to Storefront
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
