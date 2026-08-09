import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Star, ImagePlus, X, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/UseAuth';
import { useAuthModal } from '../AuthModalContext';
import { reviewsApi, Review, ReviewSummary } from '../api/reviews';

interface ReviewSectionProps {
  productId: string;
}

const MAX_IMAGES = 5;

function StarRow({ rating, size = 14, onSelect }: { rating: number; size?: number; onSelect?: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onSelect}
          onClick={() => onSelect?.(n)}
          className={onSelect ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            size={size}
            strokeWidth={1.2}
            className={n <= rating ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.25)]'}
          />
        </button>
      ))}
    </div>
  );
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const { user, token } = useAuth();
  const { setIsLoginModalOpen } = useAuthModal();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({ averageRating: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadReviews = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const res = await reviewsApi.list(productId, { limit: 20 });
      setReviews(res.data);
      setSummary(res.summary);
    } catch {
      // Non-fatal — the rest of the product page still works without reviews.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openForm = () => {
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }
    setShowForm(true);
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...images, ...files].slice(0, MAX_IMAGES);
    setImages(combined);
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p));
      return combined.map((f) => URL.createObjectURL(f));
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const resetForm = () => {
    setRating(0);
    setComment('');
    setImages([]);
    setPreviews((prev) => {
      prev.forEach((p) => URL.revokeObjectURL(p));
      return [];
    });
    setFormError('');
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      setFormError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    setFormError('');
    try {
      await reviewsApi.create(productId, rating, comment, images);
      resetForm();
      await loadReviews();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Could not submit your review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await reviewsApi.remove(reviewId);
      await loadReviews();
    } catch {
      // Non-fatal — leave the list as-is if the delete failed.
    }
  };

  const currentUserId = user?._id || user?.id;

  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-10 py-20 border-t border-[rgba(var(--theme-text-rgb),0.08)]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[10px] font-plex-mono font-light tracking-[0.45em] text-[var(--theme-accent)] mb-3 uppercase">
            Customer Reviews
          </p>
          <div className="flex items-center gap-4">
            <StarRow rating={Math.round(summary.averageRating)} size={20} />
            <span className="text-[13px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)]">
              {summary.averageRating > 0 ? summary.averageRating.toFixed(1) : 'No ratings yet'}
              {summary.count > 0 && ` · ${summary.count} review${summary.count === 1 ? '' : 's'}`}
            </span>
          </div>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={openForm}
            className="py-3 px-6 border border-[var(--theme-accent)]/32 text-[var(--theme-accent)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:bg-[var(--theme-accent)]/7 hover:border-[var(--theme-accent)]/55 transition-all duration-300 rounded-md uppercase self-start"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Write review form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-14 p-6 md:p-8 bg-[var(--theme-bg)] border border-[rgba(var(--theme-accent-rgb),0.2)] rounded-xl"
        >
          <div className="mb-5">
            <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.45)] tracking-[0.2em] uppercase block mb-2">
              Your Rating
            </span>
            <StarRow rating={rating} size={22} onSelect={setRating} />
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your thoughts on the fit, fabric, and quality…"
            maxLength={2000}
            rows={4}
            className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.12)] rounded-lg p-4 text-[13px] font-plex-mono text-[var(--theme-text)]/85 placeholder:text-[rgba(var(--theme-text-rgb),0.25)] focus:outline-none focus:border-[var(--theme-accent)]/50 transition-colors resize-none mb-5"
          />

          <div className="mb-5">
            <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.45)] tracking-[0.2em] uppercase block mb-2.5">
              Add Photos ({images.length}/{MAX_IMAGES})
            </span>
            <div className="flex flex-wrap gap-2.5">
              {previews.map((src, idx) => (
                <div key={src} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[rgba(var(--theme-text-rgb),0.12)]">
                  <img src={src} alt="Review attachment" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-0.5 right-0.5 bg-[var(--theme-bg)]/85 rounded-full p-0.5 text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-text)]"
                  >
                    <X size={10} strokeWidth={2} />
                  </button>
                </div>
              ))}
              {images.length < MAX_IMAGES && (
                <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[var(--theme-accent)]/25 hover:border-[var(--theme-accent)]/55 flex items-center justify-center cursor-pointer transition-colors">
                  <ImagePlus size={18} className="text-[var(--theme-accent)]/60" strokeWidth={1.3} />
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImagesChange} />
                </label>
              )}
            </div>
          </div>

          {formError && (
            <p className="text-[11px] font-plex-mono text-red-400 mb-4">{formError}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="py-3 px-7 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all duration-300 rounded-md disabled:opacity-40 uppercase flex items-center gap-2"
            >
              {submitting && <Loader2 size={13} className="animate-spin" />}
              Submit Review
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="py-3 px-7 border border-[rgba(var(--theme-text-rgb),0.15)] text-[rgba(var(--theme-text-rgb),0.6)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:border-[rgba(var(--theme-text-rgb),0.3)] transition-all duration-300 rounded-md uppercase"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.35)]">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <p className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.35)]">
          No reviews yet — be the first to share your experience.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {reviews.map((review) => {
            const reviewUserId = typeof review.user === 'object' ? review.user.id : review.user;
            const reviewUserName = typeof review.user === 'object' ? review.user.name : 'Customer';
            const isOwn = currentUserId && reviewUserId === currentUserId;
            return (
              <div key={review.id} className="border-b border-[rgba(var(--theme-text-rgb),0.08)] pb-8">
                <div className="flex items-center justify-between mb-2">
                  <StarRow rating={review.rating} />
                  {isOwn && (
                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="text-[rgba(var(--theme-text-rgb),0.3)] hover:text-red-400 transition-colors"
                      title="Delete review"
                    >
                      <Trash2 size={14} strokeWidth={1.4} />
                    </button>
                  )}
                </div>
                <p className="text-[11px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.45)] tracking-[0.05em] mb-3">
                  {reviewUserName} · {new Date(review.created_at).toLocaleDateString()}
                </p>
                {review.comment && (
                  <p className="text-[13px] font-plex-mono text-[var(--theme-text)]/75 leading-relaxed mb-3">
                    {review.comment}
                  </p>
                )}
                {review.images.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {review.images.map((src) => (
                      <a
                        key={src}
                        href={src}
                        target="_blank"
                        rel="noreferrer"
                        className="w-16 h-16 rounded-lg overflow-hidden border border-[rgba(var(--theme-text-rgb),0.12)] block"
                      >
                        <img src={src} alt="Review attachment" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
