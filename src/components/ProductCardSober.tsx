import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import './ProductCardSober.css';

interface ProductCardSoberProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    label?: string;
    category?: string;
    frontImg?: string;
    backImg?: string;
    [key: string]: any;
  };
  index?: number;
  onClick?: () => void;
}

/**
 * Sober, minimal product card with a vertical-wipe hover transition.
 *
 * On hover a vertical line sweeps left → right, revealing a second image layer
 * with a simultaneous zoom-in (1.15 → 1) and high-saturation (3 → 1) effect.
 * Falls back to frontImg if no backImg exists so every card gets the effect.
 */
export default function ProductCardSober({ product, index = 0, onClick }: ProductCardSoberProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const backImgRef = useRef<HTMLImageElement>(null);
  const wipeLineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const directionRef = useRef<'in' | 'out'>('out');
  const progressRef = useRef<number>(0);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(1);

  const DURATION = 600; // ms

  // Always use frontImg as fallback so every card gets the wipe effect
  const backSrc = product.backImg || product.frontImg;

  /* ── easeInOutCubic for symmetrical feel in both directions ── */
  const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ── Apply styles directly to DOM elements for guaranteed results ── */
  const applyProgress = useCallback((p: number) => {
    const backEl = backImgRef.current;
    const lineEl = wipeLineRef.current;
    if (!backEl || !lineEl) return;

    // Clip-path: reveal from left (0%) to full (100%)
    const clipRight = 100 - p * 100;
    backEl.style.clipPath = `inset(0 ${clipRight}% 0 0)`;

    // Zoom: starts at 1.35 (noticeably zoomed), settles to 1.0
    const scale = 1 + 0.35 * (1 - p);
    backEl.style.transform = `scale(${scale})`;

    // Vivid color blast: high saturation + brightness + contrast that normalizes
    const sat = 1 + 7.0 * (1 - p);       // 8 → 1
    const brightness = 1 + 0.6 * (1 - p); // 1.6 → 1
    const contrast = 1 + 0.4 * (1 - p);   // 1.4 → 1
    backEl.style.filter = `saturate(${sat}) brightness(${brightness}) contrast(${contrast})`;

    // Wipe line position and visibility
    lineEl.style.left = `${p * 100}%`;
    lineEl.style.opacity = (p > 0.01 && p < 0.99) ? '1' : '0';
  }, []);

  /* ── Animation loop ── */
  const tick = useCallback((timestamp: number) => {
    const elapsed = timestamp - startRef.current;
    const raw = Math.min(elapsed / DURATION, 1);
    const eased = ease(raw);

    // Lerp from → to using eased progress (works identically in both directions)
    progressRef.current = fromRef.current + (toRef.current - fromRef.current) * eased;

    applyProgress(progressRef.current);

    if (raw < 1) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      progressRef.current = toRef.current;
      applyProgress(progressRef.current);
    }
  }, [applyProgress]);

  /* ── Mouse enter → wipe in ── */
  const handleMouseEnter = useCallback(() => {
    if (!backSrc) return;
    cancelAnimationFrame(rafRef.current);
    fromRef.current = progressRef.current; // start from wherever we are
    toRef.current = 1;

    const startTick = (ts: number) => {
      startRef.current = ts;
      tick(ts);
    };
    rafRef.current = requestAnimationFrame(startTick);
  }, [backSrc, tick]);

  /* ── Mouse leave → wipe out (same speed, same easing, reversed) ── */
  const handleMouseLeave = useCallback(() => {
    if (!backSrc) return;
    cancelAnimationFrame(rafRef.current);
    fromRef.current = progressRef.current; // start from wherever we are
    toRef.current = 0;

    const startTick = (ts: number) => {
      startRef.current = ts;
      tick(ts);
    };
    rafRef.current = requestAnimationFrame(startTick);
  }, [backSrc, tick]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  /* ── Set initial state on mount ── */
  useEffect(() => {
    applyProgress(0);
  }, [applyProgress]);

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
      className="product-card-sober"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div ref={wrapRef} className="product-card-sober__image-wrap" data-cursor-image>
        {product.frontImg ? (
          <img
            src={product.frontImg}
            alt={product.name}
            className="product-card-sober__front"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="product-card-sober__placeholder">Image Pending</div>
        )}

        {/* Back image layer — always rendered (falls back to frontImg) */}
        {backSrc && (
          <>
            <img
              ref={backImgRef}
              src={backSrc}
              alt={`${product.name} alternate`}
              className="product-card-sober__back"
              referrerPolicy="no-referrer"
            />
            <div ref={wipeLineRef} className="product-card-sober__wipe-line" />
          </>
        )}

        {/* Subtle discount badge */}
        {product.discount && (
          <div className="product-card-sober__discount">
            <span className="product-card-sober__discount-text">{product.discount}% OFF</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="product-card-sober__info">
        <div className="product-card-sober__row">
          <h3 className="product-card-sober__name">{product.name}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span className="product-card-sober__price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="product-card-sober__original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
        </div>
        {product.label && (
          <div className="product-card-sober__category">
            <span className="product-card-sober__category-dot" />
            <span className="product-card-sober__category-text">{product.label}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
