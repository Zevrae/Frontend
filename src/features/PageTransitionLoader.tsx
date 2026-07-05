import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { usePageTransition } from "./PageTransitionContext";

/**
 * PageTransitionLoader — luxury curtain overlay.
 *
 * Renders via a Portal into document.body so overflow-x-hidden on parent
 * doesn't clip the fixed overlay.
 *
 * Sweeps in from below on every navigation click,
 * holds briefly with ZEVRAE + golden progress line,
 * then exits upward to reveal the new page.
 */
export function PageTransitionLoader() {
  const { isTransitioning } = usePageTransition();

  return createPortal(
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="page-transition-curtain"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "#0a0a0a",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
          initial={{ y: "100%" }}
          animate={{ y: "0%" }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* Brand wordmark */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.35, delay: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
            style={{
              fontFamily: "'Archivo', sans-serif",
              fontWeight: 700,
              fontStretch: "125%",
              fontSize: "clamp(1.8rem, 5vw, 3.5rem)",
              letterSpacing: "0.12em",
              color: "#EAE6E1",
            }}
          >
            ZEVRAE
          </motion.div>

          {/* Golden progress bar */}
          <div
            style={{
              marginTop: "2rem",
              position: "relative",
              width: "min(200px, 30vw)",
              height: "1px",
              background: "rgba(197,160,89,0.15)",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                position: "absolute",
                inset: 0,
                background: "#C5A059",
                transformOrigin: "left center",
              }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0, transformOrigin: "right center" }}
              transition={{ duration: 0.65, delay: 0.22, ease: [0.76, 0, 0.24, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
