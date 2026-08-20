/**
 * ZEVRAE Launch Configuration
 * ────────────────────────────
 * Single source of truth for the entire launch experience timeline.
 * Change only these values to reschedule.
 *
 * countdownEnd  → When the hero countdown reaches 00:00:00:00
 * brandLaunch   → When the normal Zevrae website becomes fully public
 */
export const LAUNCH_CONFIG = {
  /** Phase 1: Countdown reaches zero. 5-minute launch sequence begins. */
  countdownEnd: new Date('2026-08-19T13:30:00+05:30'),
  /** Phase 2: Brand goes live. Normal site unlocks for everyone. */
  brandLaunch: new Date('2026-08-19T13:46:00+05:30'),
};

/** Kept for backward compatibility with LaunchGate and ProgressLine */
export const LAUNCH_TIMESTAMP = LAUNCH_CONFIG.countdownEnd;
export const COUNTDOWN_START_TIMESTAMP = new Date('2026-08-19T01:46:00+05:30');
