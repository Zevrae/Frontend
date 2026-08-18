import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAuth } from '../hooks/UseAuth';
import { LAUNCH_TIMESTAMP } from '../config/launch';
import CountdownPage from './CountdownPage';

/**
 * LaunchGate
 * ──────────
 * Wraps the full Zevrae app and decides what to render:
 *
 *   - Auth still loading       → blank (prevents flash)
 *   - Past launch timestamp    → full site (children)
 *   - user.role === 'admin'    → full site (children)  ← backend-verified
 *   - Otherwise                → <CountdownPage />
 *
 * The admin bypass is deliberately tied to the existing backend role check —
 * no client-side-only secret or query param is used.
 */
export function LaunchGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Re-evaluate every second whether we've passed the launch timestamp
  const [isPastLaunch, setIsPastLaunch] = useState(
    () => Date.now() >= LAUNCH_TIMESTAMP.getTime()
  );
  // When the countdown reaches zero it calls this to trigger a fade to the site
  const [launched, setLaunched] = useState(isPastLaunch);

  useEffect(() => {
    if (isPastLaunch) return; // already past — nothing to poll
    const id = setInterval(() => {
      if (Date.now() >= LAUNCH_TIMESTAMP.getTime()) {
        setIsPastLaunch(true);
        clearInterval(id);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [isPastLaunch]);

  const handleLaunch = useCallback(() => {
    setLaunched(true);
  }, []);

  // While auth is resolving, show nothing (prevents brief flash of countdown
  // for an admin who reloads the page while logged in)
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#050505',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      />
    );
  }

  // Admins always see the full site — backend-verified role
  if (isAdmin) {
    return <>{children}</>;
  }

  // Past launch or countdown already played out → full site
  if (isPastLaunch || launched) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="site"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Pre-launch: public sees the countdown
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="countdown"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
      >
        <CountdownPage onLaunch={handleLaunch} />
      </motion.div>
    </AnimatePresence>
  );
}
