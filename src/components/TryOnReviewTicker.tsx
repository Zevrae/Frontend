import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, X, Sparkles } from 'lucide-react';
import { reviewsApi, Review } from '../api/reviews';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

function getReviewerName(review: Review): string {
  if (typeof review.user === 'object' && review.user !== null) {
    return review.user.name || 'Customer';
  }
  return 'Customer';
}

/** Returns the first N words of a string, appended with "…" if truncated. */
function truncateWords(text: string, wordCount = 3): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= wordCount) return text;
  return words.slice(0, wordCount).join(' ') + '…';
}

/* ─────────────────────────────────────────────
   Full-review popover
───────────────────────────────────────────── */
function ReviewPopover({
  review,
  onClose,
}: {
  review: Review;
  onClose: () => void;
}) {
  const name = getReviewerName(review);
  const date = new Date(review.created_at).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Close on ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.97 }}
        transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative w-full max-w-sm bg-[var(--theme-bg)] border border-[var(--theme-accent)]/30 rounded-2xl shadow-[0_0_60px_rgba(var(--theme-accent-rgb),0.1),0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--theme-accent-rgb),0.6)] to-transparent" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[13px] font-archivo font-semibold tracking-wide text-[var(--theme-text)]">
                {name}
              </p>
              <p className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] mt-0.5">
                {date}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-[rgba(var(--theme-text-rgb),0.35)] hover:text-[var(--theme-accent)] transition-colors p-1"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={13}
                strokeWidth={1.2}
                className={
                  n <= review.rating
                    ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]'
                    : 'text-[rgba(var(--theme-text-rgb),0.2)]'
                }
              />
            ))}
          </div>

          {/* Comment */}
          {review.comment ? (
            <p className="text-[12px] font-plex-mono text-[var(--theme-text)]/75 leading-relaxed mb-4">
              "{review.comment}"
            </p>
          ) : (
            <p className="text-[11px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.35)] italic mb-4">
              No written comment.
            </p>
          )}

          {/* Attached images */}
          {review.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {review.images.map((src) => (
                <a
                  key={src}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  className="w-16 h-16 rounded-lg overflow-hidden border border-[rgba(var(--theme-accent-rgb),0.2)] block hover:border-[var(--theme-accent)]/50 transition-colors"
                >
                  <img src={src} alt="Review attachment" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

const STATIC_REVIEWS: Review[] = [
  {
    id: 'static-1',
    product: 'prod-1',
    user: { id: 'u1', name: 'Alice M.' },
    rating: 5,
    comment: 'Absolutely love the fit and quality. The try-on was so helpful!',
    images: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'static-2',
    product: 'prod-2',
    user: { id: 'u2', name: 'John D.' },
    rating: 4,
    comment: 'Looks great! Fabric feels premium. Sizing was spot on.',
    images: [],
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'static-3',
    product: 'prod-3',
    user: { id: 'u3', name: 'Sarah K.' },
    rating: 5,
    comment: 'Obsessed with this piece. The virtual preview looked exactly like reality.',
    images: [],
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

/* ─────────────────────────────────────────────
   Main Ticker
───────────────────────────────────────────── */
export default function TryOnReviewTicker() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeReview, setActiveReview] = useState<Review | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    reviewsApi.listAll({ limit: 40 }).then((data) => {
      // Only show reviews that have a comment (or at least a rating)
      const filtered = data.filter((r) => r.comment || r.rating > 0);
      setReviews([...filtered, ...STATIC_REVIEWS]);
    });
  }, []);

  // Need at least 2 reviews to show a meaningful ticker
  if (reviews.length < 2) return null;

  // Duplicate multiple times for a seamless loop on very wide screens
  const items = [...reviews, ...reviews, ...reviews, ...reviews];

  const pillClass =
    'inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(var(--theme-accent-rgb),0.18)] bg-[rgba(var(--theme-accent-rgb),0.04)] hover:border-[rgba(var(--theme-accent-rgb),0.45)] hover:bg-[rgba(var(--theme-accent-rgb),0.1)] transition-all duration-200 cursor-pointer flex-shrink-0 select-none group';

  return (
    <>
      {/* Ticker strip */}
      <div
        className="relative w-full overflow-hidden border-y border-[rgba(var(--theme-text-rgb),0.07)] bg-[var(--theme-bg)]"
        style={{ height: '48px' }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left / right fade masks */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20"
          style={{
            background: 'linear-gradient(to right, var(--theme-bg) 30%, transparent)',
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20"
          style={{
            background: 'linear-gradient(to left, var(--theme-bg) 30%, transparent)',
          }}
        />

        {/* Scrolling track */}
        <div
          ref={trackRef}
          className="flex items-center h-full gap-4 pl-4"
          style={{
            width: 'max-content',
            animation: `tryon-ticker-scroll ${items.length * 3}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {items.map((review, idx) => {
            const name = getReviewerName(review);
            const preview = review.comment ? truncateWords(review.comment, 3) : '★'.repeat(review.rating);
            return (
              <button
                key={`${review.id}-${idx}`}
                type="button"
                className={pillClass}
                onClick={() => setActiveReview(review)}
                aria-label={`Review by ${name}: ${preview}`}
              >
                {/* Mini stars */}
                <span className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      size={8}
                      strokeWidth={1}
                      className={
                        n <= review.rating
                          ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]'
                          : 'text-[rgba(var(--theme-text-rgb),0.15)]'
                      }
                    />
                  ))}
                </span>

                {/* Separator dot */}
                <span className="w-px h-3 bg-[rgba(var(--theme-text-rgb),0.12)]" />

                {/* Name */}
                <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.65)] tracking-wide group-hover:text-[var(--theme-text)] transition-colors whitespace-nowrap">
                  {name}
                </span>

                {/* Preview text */}
                {review.comment && (
                  <>
                    <span className="text-[rgba(var(--theme-accent-rgb),0.3)] text-[9px]">·</span>
                    <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] group-hover:text-[rgba(var(--theme-text-rgb),0.65)] transition-colors whitespace-nowrap italic">
                      {preview}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Keyframe injection */}
      <style>{`
        @keyframes tryon-ticker-scroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Full-review popover */}
      <AnimatePresence>
        {activeReview && (
          <ReviewPopover
            key={activeReview.id}
            review={activeReview}
            onClose={() => setActiveReview(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
