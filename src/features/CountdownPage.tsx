import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LAUNCH_TIMESTAMP, COUNTDOWN_START_TIMESTAMP } from '../config/launch';
import { useAuthModal } from '../AuthModalContext';

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
function getTimeLeft(): TimeLeft {
  const total = Math.max(0, LAUNCH_TIMESTAMP.getTime() - Date.now());
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { days, hours, minutes, seconds, total };
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/* ─────────────────────────────────────────────────────────────
   AnimatedDigit — subtle slide-up/fade on change
───────────────────────────────────────────────────────────── */
function AnimatedDigit({ value }: { value: string }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', lineHeight: 1 }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
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
   CountdownUnit
───────────────────────────────────────────────────────────── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
  const padded = pad(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 'clamp(2.8rem, 8vw, 6.5rem)',
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: '#C5A059',
          lineHeight: 1,
          display: 'flex',
        }}
      >
        <AnimatedDigit value={padded[0]} />
        <AnimatedDigit value={padded[1]} />
      </div>
      <span
        style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 'clamp(0.55rem, 1.2vw, 0.72rem)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'rgba(197,160,89,0.45)',
          fontWeight: 400,
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Separator dot
───────────────────────────────────────────────────────────── */
function Separator() {
  return (
    <div
      style={{
        color: 'rgba(197,160,89,0.3)',
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 'clamp(2rem, 5vw, 4.5rem)',
        fontWeight: 300,
        lineHeight: 1,
        alignSelf: 'flex-start',
        marginTop: '0.15em',
        userSelect: 'none',
      }}
    >
      :
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Progress Line
───────────────────────────────────────────────────────────── */
function ProgressLine() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startMs = COUNTDOWN_START_TIMESTAMP.getTime();
    const totalWindow = LAUNCH_TIMESTAMP.getTime() - startMs;

    const update = () => {
      const elapsed = Date.now() - startMs;
      setProgress(Math.min(1, Math.max(0, elapsed / totalWindow)));
    };

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: 'clamp(200px, 40vw, 480px)',
        height: '1px',
        background: 'rgba(197,160,89,0.12)',
        borderRadius: '1px',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(197,160,89,0.3) 0%, rgba(197,160,89,0.7) 100%)',
          transformOrigin: 'left center',
        }}
        animate={{ scaleX: progress }}
        transition={{ duration: 1, ease: 'linear' }}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main CountdownPage
───────────────────────────────────────────────────────────── */
interface CountdownPageProps {
  onLaunch: () => void;
}

export default function CountdownPage({ onLaunch }: CountdownPageProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [launched, setLaunched] = useState(false);
  const { setIsLoginModalOpen } = useAuthModal();
  const launchedRef = useRef(false);

  const tick = useCallback(() => {
    const t = getTimeLeft();
    setTimeLeft(t);
    if (t.total <= 0 && !launchedRef.current) {
      launchedRef.current = true;
      setLaunched(true);
      // After showing the "THE WAIT IS OVER" message, switch to full site
      setTimeout(() => onLaunch(), 2800);
    }
  }, [onLaunch]);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  const brandFont = "'Archivo', sans-serif";
  const monoFont = "'IBM Plex Mono', monospace";

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Noise grain layer ── */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          opacity: 0.04,
          pointerEvents: 'none',
          zIndex: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* ── Very subtle gold ambient glow ── */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60vw',
          height: '60vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(197,160,89,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── ADMIN LOGIN — top right ── */}
      <div
        style={{
          position: 'fixed',
          top: '28px',
          right: '32px',
          zIndex: 20,
        }}
      >
        <button
          onClick={() => setIsLoginModalOpen(true)}
          style={{
            fontFamily: monoFont,
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'rgba(197,160,89,0.35)',
            background: 'none',
            border: '1px solid rgba(197,160,89,0.15)',
            padding: '7px 14px',
            cursor: 'pointer',
            transition: 'color 0.3s ease, border-color 0.3s ease',
          }}
          onMouseEnter={e => {
            (e.target as HTMLButtonElement).style.color = 'rgba(197,160,89,0.75)';
            (e.target as HTMLButtonElement).style.borderColor = 'rgba(197,160,89,0.4)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLButtonElement).style.color = 'rgba(197,160,89,0.35)';
            (e.target as HTMLButtonElement).style.borderColor = 'rgba(197,160,89,0.15)';
          }}
        >
          Admin Login
        </button>
      </div>

      {/* ── Main content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
          padding: '40px 24px',
          width: '100%',
          maxWidth: '900px',
          textAlign: 'center',
        }}
      >
        <AnimatePresence mode="wait">
          {launched ? (
            /* ── Launch moment message ── */
            <motion.div
              key="launched"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <h1
                style={{
                  fontFamily: brandFont,
                  fontWeight: 800,
                  fontSize: 'clamp(3rem, 14vw, 18rem)',
                  fontStretch: '125%',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.88,
                  color: '#EAE6E1',
                  margin: 0,
                }}
              >
                ZEVRAE
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                style={{
                  fontFamily: monoFont,
                  fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#C5A059',
                  marginTop: '32px',
                }}
              >
                The Wait Is Over
              </motion.p>
            </motion.div>
          ) : (
            /* ── Countdown content ── */
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0',
                width: '100%',
              }}
            >
              {/* ZEVRAE wordmark — breathing animation */}
              <motion.h1
                animate={{
                  scale: [1, 1.008, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  fontFamily: brandFont,
                  fontWeight: 800,
                  fontSize: 'clamp(3rem, 14vw, 18rem)',
                  fontStretch: '125%',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.88,
                  color: '#EAE6E1',
                  margin: 0,
                  transformOrigin: 'center center',
                  willChange: 'transform',
                }}
              >
                ZEVRAE
              </motion.h1>

              {/* Divider line */}
              <div
                style={{
                  height: '1px',
                  background: 'rgba(197,160,89,0.25)',
                  width: 'clamp(180px, 30vw, 440px)',
                  marginTop: '1.2rem',
                }}
              />

              {/* Brand quote */}
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontStyle: 'italic',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
                  color: 'rgba(234,230,225,0.45)',
                  letterSpacing: '0.01em',
                  marginTop: '1.4rem',
                  marginBottom: '0',
                }}
              >
                Luxury is a Matter of Choice
              </p>

              {/* THE WAIT ENDS label */}
              <p
                style={{
                  fontFamily: monoFont,
                  fontSize: 'clamp(0.6rem, 1.3vw, 0.78rem)',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                  color: 'rgba(197,160,89,0.55)',
                  marginTop: '3rem',
                  marginBottom: '0',
                  fontWeight: 400,
                }}
              >
                The Wait Ends
              </p>

              {/* Countdown digits */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 'clamp(8px, 2.5vw, 28px)',
                  marginTop: '1.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}
              >
                <CountdownUnit value={timeLeft.days} label="Days" />
                <Separator />
                <CountdownUnit value={timeLeft.hours} label="Hours" />
                <Separator />
                <CountdownUnit value={timeLeft.minutes} label="Minutes" />
                <Separator />
                <CountdownUnit value={timeLeft.seconds} label="Seconds" />
              </div>

              {/* Progress line */}
              <div style={{ marginTop: '2.5rem' }}>
                <ProgressLine />
              </div>

              {/* Launch date */}
              <p
                style={{
                  fontFamily: monoFont,
                  fontSize: 'clamp(0.6rem, 1.1vw, 0.72rem)',
                  letterSpacing: '0.35em',
                  color: 'rgba(197,160,89,0.3)',
                  marginTop: '1.4rem',
                  fontWeight: 400,
                }}
              >
                19 · 08 · 2026
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
