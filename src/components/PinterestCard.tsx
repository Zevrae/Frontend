import { useRef, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import './PinterestCard.css';

interface PinterestCardProps {
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
 * Pinterest-style product card with natural image heights and
 * bottom-overlay hover reveal. Designed for CSS-columns masonry grid.
 *
 * Retains the signature vertical-wipe reveal effect from ProductCardSober
 * for visual brand consistency.
 */
export default function PinterestCard({ product, index = 0, onClick }: PinterestCardProps) {
  const backImgRef = useRef<HTMLImageElement>(null);
  const wipeLineRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const progressRef = useRef<number>(0);
  const fromRef = useRef<number>(0);
  const toRef = useRef<number>(1);

  const DURATION = 600; // ms

  // Always use frontImg as fallback so every card gets the wipe effect
  const backSrc = product.backImg || product.frontImg;

  /* ── easeInOutCubic ── */
  const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* ── Apply wipe progress directly to DOM elements ── */
  const applyProgress = useCallback((p: number) => {
    const backEl = backImgRef.current;
    const lineEl = wipeLineRef.current;
    if (!backEl || !lineEl) return;

    const clipRight = 100 - p * 100;
    backEl.style.clipPath = `inset(0 ${clipRight}% 0 0)`;

    const scale = 1 + 0.35 * (1 - p);
    backEl.style.transform = `scale(${scale})`;

    const sat = 1 + 7.0 * (1 - p);
    const brightness = 1 + 0.6 * (1 - p);
    const contrast = 1 + 0.4 * (1 - p);
    backEl.style.filter = `saturate(${sat}) brightness(${brightness}) contrast(${contrast})`;

    lineEl.style.left = `${p * 100}%`;
    lineEl.style.opacity = (p > 0.01 && p < 0.99) ? '1' : '0';
  }, []);

  /* ── Animation loop ── */
  const tick = useCallback((timestamp: number) => {
    const elapsed = timestamp - startRef.current;
    const raw = Math.min(elapsed / DURATION, 1);
    const eased = ease(raw);

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
    fromRef.current = progressRef.current;
    toRef.current = 1;

    const startTick = (ts: number) => {
      startRef.current = ts;
      tick(ts);
    };
    rafRef.current = requestAnimationFrame(startTick);
  }, [backSrc, tick]);

  /* ── Mouse leave → wipe out ── */
  const handleMouseLeave = useCallback(() => {
    if (!backSrc) return;
    cancelAnimationFrame(rafRef.current);
    fromRef.current = progressRef.current;
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
      transition={{ duration: 0.6, delay: (index % 5) * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      className="pinterest-card"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="pinterest-card__image-wrap">
        {product.frontImg ? (
          <img
            src={product.frontImg}
            alt={product.name}
            className="pinterest-card__front"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="pinterest-card__placeholder">Image Pending</div>
        )}

        {/* Back image layer — wipe reveal */}
        {backSrc && (
          <>
            <img
              ref={backImgRef}
              src={backSrc}
              alt={`${product.name} alternate`}
              className="pinterest-card__back"
              referrerPolicy="no-referrer"
            />
            <div ref={wipeLineRef} className="pinterest-card__wipe-line" />
          </>
        )}

        {/* Hover overlay gradient */}
        <div className="pinterest-card__overlay" />

        {/* Product info — appears on hover over the image */}
        <div className="pinterest-card__info">
          <h3 className="pinterest-card__name">{product.name}</h3>
          <div className="pinterest-card__price-row">
            <span className="pinterest-card__price">{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span className="pinterest-card__original-price">{formatPrice(product.originalPrice)}</span>
            )}
          </div>
          {product.label && (
            <div className="pinterest-card__category">
              <span className="pinterest-card__category-dot" />
              <span className="pinterest-card__category-text">{product.label}</span>
            </div>
          )}
        </div>

        {/* Discount badge */}
        {product.discount && (
          <div className="pinterest-card__discount">
            <span className="pinterest-card__discount-text">{product.discount}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
