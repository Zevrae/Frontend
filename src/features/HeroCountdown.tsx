import React, { useEffect, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LAUNCH_CONFIG } from '../config/launch';

/* ─────────────────────────────────────────────────────────────
   Phase detection
───────────────────────────────────────────────────────────── */
export type LaunchPhase = 'counting' | 'sequence' | 'live';

export function getLaunchPhase(): LaunchPhase {
  const now = Date.now();
  if (now >= LAUNCH_CONFIG.brandLaunch.getTime()) return 'live';
  if (now >= LAUNCH_CONFIG.countdownEnd.getTime()) return 'sequence';
  return 'counting';
}

/* ─────────────────────────────────────────────────────────────
   Time helpers
───────────────────────────────────────────────────────────── */
function getCountdownLeft() {
  const total = Math.max(0, LAUNCH_CONFIG.countdownEnd.getTime() - Date.now());
  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function getSequenceLeft() {
  const total = Math.max(0, LAUNCH_CONFIG.brandLaunch.getTime() - Date.now());
  return {
    minutes: Math.floor(total / (1000 * 60)),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/* ─────────────────────────────────────────────────────────────
   AnimatedDigit — subtle vertical slide on change
───────────────────────────────────────────────────────────── */
function AnimatedDigit({ value }: { value: string }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', lineHeight: 1 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ display: 'inline-block', willChange: 'transform, opacity' }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HeroCountdown
   Renders the countdown / launch sequence inside the Hero.
   Returns null once the phase is 'live'.
───────────────────────────────────────────────────────────── */
interface HeroCountdownProps {
  onLive: () => void;
}

export default function HeroCountdown({ onLive }: HeroCountdownProps) {
  const [phase, setPhase] = useState<LaunchPhase>(getLaunchPhase);
  const [countdown, setCountdown] = useState(getCountdownLeft);
  const [sequence, setSequence] = useState(getSequenceLeft);
  const liveRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => {
      const p = getLaunchPhase();
      setPhase(p);
      if (p === 'counting') setCountdown(getCountdownLeft());
      if (p === 'sequence') setSequence(getSequenceLeft());
      if (p === 'live' && !liveRef.current) {
        liveRef.current = true;
        // Brief "THE WAIT IS OVER" moment before unlocking
        setTimeout(() => onLive(), 2200);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [onLive]);

  const monoFont = "'IBM Plex Mono', monospace";
  const gold = '#C5A059';
  const goldFaint = 'rgba(197,160,89,0.45)';
  const goldDim = 'rgba(197,160,89,0.28)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        marginTop: '2.8rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <AnimatePresence mode="wait">

        {/* ── Phase 1: COUNTING ── */}
        {phase === 'counting' && (
          <motion.div
            key="counting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
          >
            {/* THE WAIT ENDS */}
            <p style={{
              fontFamily: monoFont,
              fontSize: 'clamp(0.52rem, 1vw, 0.68rem)',
              letterSpacing: '0.42em',
              textTransform: 'uppercase',
              color: goldFaint,
              margin: 0,
              marginBottom: '1.3rem',
              fontWeight: 400,
            }}>
              The Wait Ends
            </p>

            {/* Digits row */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 'clamp(6px, 2vw, 18px)',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}>
              {[
                { value: countdown.days, label: 'Days' },
                { value: countdown.hours, label: 'Hours' },
                { value: countdown.minutes, label: 'Minutes' },
                { value: countdown.seconds, label: 'Seconds' },
              ].map((unit, i) => (
                <React.Fragment key={unit.label}>
                  {i > 0 && (
                    <div style={{
                      color: 'rgba(197,160,89,0.25)',
                      fontFamily: monoFont,
                      fontSize: 'clamp(1rem, 2.8vw, 2rem)',
                      lineHeight: 1,
                      alignSelf: 'flex-start',
                      marginTop: '0.1em',
                    }}>:</div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
                    <div style={{
                      fontFamily: monoFont,
                      fontSize: 'clamp(1.6rem, 4vw, 3rem)',
                      fontWeight: 600,
                      color: gold,
                      lineHeight: 1,
                      display: 'flex',
                      letterSpacing: '-0.02em',
                    }}>
                      <AnimatedDigit value={pad(unit.value)[0]} />
                      <AnimatedDigit value={pad(unit.value)[1]} />
                    </div>
                    <span style={{
                      fontFamily: monoFont,
                      fontSize: 'clamp(0.42rem, 0.8vw, 0.56rem)',
                      letterSpacing: '0.25em',
                      textTransform: 'uppercase',
                      color: goldDim,
                      fontWeight: 400,
                    }}>{unit.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Launch date */}
            <p style={{
              fontFamily: monoFont,
              fontSize: 'clamp(0.48rem, 0.85vw, 0.62rem)',
              letterSpacing: '0.3em',
              color: goldDim,
              marginTop: '1.1rem',
              marginBottom: 0,
              fontWeight: 400,
            }}>
              19 · 08 · 2026
            </p>
          </motion.div>
        )}

        {/* ── Phase 2: LAUNCH SEQUENCE (12:20 → 12:25) ── */}
        {(phase === 'sequence' || (phase === 'live' && !liveRef.current)) && (
          <motion.div
            key="sequence"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}
          >
            {/* THE WAIT IS OVER */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              style={{
                fontFamily: monoFont,
                fontSize: 'clamp(0.52rem, 1vw, 0.68rem)',
                letterSpacing: '0.42em',
                textTransform: 'uppercase',
                color: gold,
                margin: 0,
                marginBottom: '0.5rem',
                fontWeight: 400,
              }}
            >
              The Wait Is Over
            </motion.p>

            {/* GOES LIVE IN */}
            <p style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 700,
              fontSize: 'clamp(0.6rem, 1.3vw, 0.82rem)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(234,230,225,0.4)',
              margin: 0,
              marginBottom: '1rem',
            }}>
              Goes Live In
            </p>

            {/* MM:SS countdown */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              fontFamily: monoFont,
              fontSize: 'clamp(2rem, 5.5vw, 4rem)',
              fontWeight: 600,
              color: gold,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>
              <AnimatedDigit value={pad(sequence.minutes)[0]} />
              <AnimatedDigit value={pad(sequence.minutes)[1]} />
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{ color: 'rgba(197,160,89,0.35)', margin: '0 3px' }}
              >:</motion.span>
              <AnimatedDigit value={pad(sequence.seconds)[0]} />
              <AnimatedDigit value={pad(sequence.seconds)[1]} />
            </div>

            {/* Subtle gold progress line for the 5-min window */}
            <SequenceProgressLine />
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   5-minute sequence progress line
───────────────────────────────────────────────────────────── */
function SequenceProgressLine() {
  const [progress, setProgress] = useState(() => {
    const total = LAUNCH_CONFIG.brandLaunch.getTime() - LAUNCH_CONFIG.countdownEnd.getTime();
    const elapsed = Date.now() - LAUNCH_CONFIG.countdownEnd.getTime();
    return Math.min(1, Math.max(0, elapsed / total));
  });

  useEffect(() => {
    const total = LAUNCH_CONFIG.brandLaunch.getTime() - LAUNCH_CONFIG.countdownEnd.getTime();
    const id = setInterval(() => {
      const elapsed = Date.now() - LAUNCH_CONFIG.countdownEnd.getTime();
      setProgress(Math.min(1, Math.max(0, elapsed / total)));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      width: 'clamp(120px, 20vw, 240px)',
      height: '1px',
      background: 'rgba(197,160,89,0.1)',
      marginTop: '1.4rem',
      borderRadius: '1px',
      overflow: 'hidden',
    }}>
      <motion.div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, rgba(197,160,89,0.3) 0%, rgba(197,160,89,0.65) 100%)',
          transformOrigin: 'left center',
        }}
        animate={{ scaleX: progress }}
        transition={{ duration: 1, ease: 'linear' }}
      />
    </div>
  );
}
