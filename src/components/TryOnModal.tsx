import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, RefreshCw, Download, CheckCircle2, Sparkles, AlertCircle, Check, Star, Send, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/UseAuth';
import { useAuthModal } from '../AuthModalContext';
import { tryonApi } from '../api/tryon';
import { buildImageProxyUrl } from '../api/images';
import { reviewsApi } from '../api/reviews';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  // All of the product's own photos the shopper can pick from as garments —
  // one or more can be combined into a single try-on generation.
  clothImages: string[];
}

const MAX_CLOTH_IMAGES = 5;

type Stage = 'upload' | 'generating' | 'result' | 'error';

export default function TryOnModal({ isOpen, onClose, productId, clothImages }: TryOnModalProps) {
  const { token } = useAuth();
  const { setIsLoginModalOpen } = useAuthModal();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCloths, setSelectedCloths] = useState<string[]>(() => (clothImages[0] ? [clothImages[0]] : []));
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('upload');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Review form state (result stage)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewHoverRating, setReviewHoverRating] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setSelectedFile(null);
      setSelectedCloths(clothImages[0] ? [clothImages[0]] : []);
      setGeneratedImage(null);
      setStage('upload');
      setProgress(0);
      setErrorMessage('');
      setShowReviewForm(false);
      setReviewRating(0);
      setReviewComment('');
      setReviewSubmitting(false);
      setReviewSubmitted(false);
      setReviewError('');
      setReviewHoverRating(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Require login before letting someone start a try-on — mirrors the same
  // check used at add-to-cart/checkout elsewhere in the app.
  useEffect(() => {
    if (isOpen && !token) {
      onClose();
      setIsLoginModalOpen(true);
    }
  }, [isOpen, token]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleCloth = (url: string) => {
    setSelectedCloths((prev) => {
      if (prev.includes(url)) return prev.filter((u) => u !== url);
      if (prev.length >= MAX_CLOTH_IMAGES) return prev;
      return [...prev, url];
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setSelectedFile(file);
      setGeneratedImage(null);
      setStage('upload');
      setErrorMessage('');
    }
  };

  // Real generation takes anywhere from a few seconds to ~30-45s (Gemini +
  // Appwrite upload round trip, longer with several garments). Rather than
  // holding one HTTP request open that long — fragile against proxy/load
  // balancer timeouts in production — the backend starts a background job
  // and we poll for its result. The progress bar is still a visual
  // approximation (no granular progress from the microservice), but it's
  // now driven by real poll responses rather than a blind client-side timer.
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const handleGenerate = async () => {
    if (!selectedFile || selectedCloths.length === 0) return;
    setStage('generating');
    setProgress(0);
    setErrorMessage('');

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.random() * 4 + 1));
    }, 600);

    const stopTimers = () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };

    try {
      const job = await tryonApi.start(productId, selectedFile, selectedCloths);

      const startedAt = Date.now();
      const MAX_WAIT_MS = 120000; // give up after 2 minutes — generation is normally well under 1

      pollTimerRef.current = setInterval(async () => {
        try {
          const current = await tryonApi.getStatus(job.id);

          if (current.status === 'completed') {
            stopTimers();
            setProgress(100);
            setGeneratedImage(current.imageUrl || null);
            setStage('result');
            return;
          }

          if (current.status === 'failed') {
            stopTimers();
            setProgress(0);
            setErrorMessage(current.error || 'Something went wrong generating your try-on.');
            setStage('error');
            return;
          }

          if (Date.now() - startedAt > MAX_WAIT_MS) {
            stopTimers();
            setProgress(0);
            setErrorMessage('This is taking longer than expected. Please try again in a moment.');
            setStage('error');
          }
        } catch (pollErr) {
          // A single failed poll (e.g. transient network blip) shouldn't
          // abort the whole job — keep polling until MAX_WAIT_MS.
          if (Date.now() - startedAt > MAX_WAIT_MS) {
            stopTimers();
            setProgress(0);
            setErrorMessage('Lost connection while checking your try-on. Please try again.');
            setStage('error');
          }
        }
      }, 2500);
    } catch (err: any) {
      stopTimers();
      setProgress(0);
      const status = err?.response?.status;
      const message =
        status === 503
          ? 'Virtual try-on is not available right now. Please try again later.'
          : err?.response?.data?.message || err?.message || 'Something went wrong starting your try-on.';
      setErrorMessage(message);
      setStage('error');
    }
  };

  const handleRegenerate = () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    setGeneratedImage(null);
    setStage('upload');
    setProgress(0);
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      // The generated image is hosted on Appwrite too, so it goes through
      // the backend proxy rather than being fetch()'d directly — Appwrite's
      // CORS policy would otherwise block this from the browser.
      const res = await fetch(buildImageProxyUrl(generatedImage));
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = 'zevrae-tryon.jpg';
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fall back to just opening the image so the user can still save it manually.
      window.open(generatedImage, '_blank');
    }
  };

  const clampedProgress = Math.min(Math.round(progress), 100);

  // Fetch the generated try-on image as a File blob, then submit a review.
  const handleReviewSubmit = async () => {
    if (reviewRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    if (!generatedImage) return;
    setReviewSubmitting(true);
    setReviewError('');
    try {
      let imageFiles: File[] = [];
      try {
        const res = await fetch(buildImageProxyUrl(generatedImage));
        const blob = await res.blob();
        const ext = blob.type.includes('png') ? 'png' : 'jpg';
        imageFiles = [new File([blob], `tryon-review.${ext}`, { type: blob.type })];
      } catch {
        // If fetching the image fails just submit without attaching it.
      }
      await reviewsApi.create(productId, reviewRating, reviewComment, imageFiles);
      setReviewSubmitted(true);
    } catch (err: any) {
      setReviewError(err?.response?.data?.message || 'Could not submit your review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/55 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 14 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-[500px] bg-[var(--theme-bg)] border border-[var(--theme-accent)]/35 rounded-[18px] shadow-[0_0_60px_rgba(var(--theme-accent-rgb),0.12),0_24px_60px_rgba(0,0,0,0.55)] max-h-[92vh] overflow-y-auto"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(var(--theme-accent-rgb),0.55)] to-transparent rounded-t-[18px]" />

            <div className="p-8 md:p-10">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors focus:outline-none z-10"
              >
                <X size={22} strokeWidth={1} />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-[10px] font-plex-mono font-light tracking-[0.45em] text-[var(--theme-accent)] mb-3 uppercase">
                  Virtual Try-On
                </p>
                <h2 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.08em] uppercase text-[var(--theme-text)]">
                  See It On You
                </h2>
                <p className="text-[11px] font-plex-mono tracking-[0.05em] text-[rgba(var(--theme-text-rgb),0.4)] mt-3">
                  {stage === 'result'
                    ? 'Your AI-generated try-on is ready.'
                    : stage === 'error'
                    ? "Something didn't go as planned."
                    : 'Pick one or more photos of the piece, then upload yours.'}
                </p>
              </div>

              {/* ── STAGES ── */}
              <AnimatePresence mode="wait">

                {/* UPLOAD STAGE */}
                {stage === 'upload' && (
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                  >
                    {/* Cloth image multi-select */}
                    {clothImages.length > 1 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.45)] tracking-[0.2em] uppercase">
                            Choose garment photos
                          </span>
                          <span className="text-[10px] font-plex-mono text-[var(--theme-accent)]/70 tracking-[0.1em]">
                            {selectedCloths.length}/{MAX_CLOTH_IMAGES}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {clothImages.slice(0, 8).map((url) => {
                            const isSelected = selectedCloths.includes(url);
                            return (
                              <button
                                key={url}
                                type="button"
                                onClick={() => toggleCloth(url)}
                                className={`relative aspect-square rounded-lg overflow-hidden border transition-all duration-200 ${
                                  isSelected
                                    ? 'border-[var(--theme-accent)] ring-1 ring-[rgba(var(--theme-accent-rgb),0.6)]'
                                    : 'border-[rgba(var(--theme-text-rgb),0.12)] hover:border-[rgba(var(--theme-accent-rgb),0.4)]'
                                }`}
                              >
                                <img src={url} alt="Garment option" className="w-full h-full object-cover" />
                                {isSelected && (
                                  <div className="absolute top-1 right-1 bg-[var(--theme-accent)] rounded-full p-0.5">
                                    <Check size={10} strokeWidth={3} className="text-[var(--theme-bg)]" />
                                  </div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mb-6">
                      {!selectedImage ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-64 border-2 border-dashed border-[var(--theme-accent)]/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[var(--theme-accent)]/55 hover:bg-[var(--theme-accent)]/[0.03] transition-all duration-300 bg-[var(--theme-surface)]"
                        >
                          <div className="w-14 h-14 rounded-full bg-[rgba(var(--theme-accent-rgb),0.1)] flex items-center justify-center mb-4">
                            <UploadCloud size={26} className="text-[var(--theme-accent)]/65" strokeWidth={1.2} />
                          </div>
                          <span className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] tracking-[0.15em] uppercase">
                            Click to upload your photo
                          </span>
                          <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.3)] mt-2 tracking-wide">
                            JPG, PNG up to 5MB
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-64 rounded-xl overflow-hidden relative border border-[rgba(var(--theme-accent-rgb),0.3)] bg-[var(--theme-surface)] flex items-center justify-center">
                          <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                          <button
                            onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute top-3 right-3 bg-[var(--theme-bg)]/80 hover:bg-[var(--theme-bg)] p-1.5 rounded-full text-[rgba(var(--theme-text-rgb),0.6)] hover:text-[var(--theme-text)] transition-all border border-[rgba(var(--theme-text-rgb),0.1)]"
                          >
                            <X size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[var(--theme-bg)]/70 backdrop-blur-sm text-[var(--theme-accent)] text-[10px] font-plex-mono tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-[rgba(var(--theme-accent-rgb),0.3)] hover:bg-[rgba(var(--theme-accent-rgb),0.1)] transition-all"
                          >
                            Change Photo
                          </button>
                        </div>
                      )}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </div>

                    <button
                      type="button"
                      disabled={!selectedImage || selectedCloths.length === 0}
                      onClick={handleGenerate}
                      className="w-full py-4 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all duration-300 rounded-md disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 uppercase"
                    >
                      <Sparkles size={14} strokeWidth={2} />
                      Generate Preview
                    </button>
                  </motion.div>
                )}

                {/* GENERATING STAGE */}
                {stage === 'generating' && (
                  <motion.div
                    key="generating"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                    className="flex flex-col items-center"
                  >
                    {/* Preview + shimmer overlay */}
                    <div className="relative w-full h-72 rounded-xl overflow-hidden bg-[var(--theme-surface)] border border-[rgba(var(--theme-accent-rgb),0.2)] mb-7">
                      {selectedImage && (
                        <img
                          src={selectedImage}
                          alt="Processing"
                          className="w-full h-full object-contain opacity-25"
                        />
                      )}
                      {/* Shimmer sweep */}
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                          animate={{ x: ['-100%', '220%'] }}
                          transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 0.5 }}
                          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[rgba(var(--theme-accent-rgb),0.1)] to-transparent -skew-x-12"
                        />
                      </div>
                      {/* Progress ring */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="relative w-16 h-16">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="var(--theme-accent)" strokeOpacity="0.12" strokeWidth="2.5" />
                            <motion.circle
                              cx="32" cy="32" r="28"
                              fill="none"
                              stroke="var(--theme-accent)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - clampedProgress / 100)}`}
                              transition={{ ease: 'easeOut', duration: 0.25 }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-plex-mono text-[var(--theme-accent)] font-bold">
                            {clampedProgress}%
                          </span>
                        </div>
                        <p className="text-[11px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.45)] tracking-[0.2em] uppercase">
                          Crafting your look…
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-[1.5px] bg-[rgba(var(--theme-text-rgb),0.08)] rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[rgba(var(--theme-accent-rgb),0.5)] to-[var(--theme-accent)]"
                        style={{ width: `${clampedProgress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.25 }}
                      />
                    </div>
                    <p className="text-[10px] font-plex-mono text-[var(--theme-text)]/28 tracking-[0.15em] uppercase text-center">
                      AI is styling you — this takes a few seconds
                    </p>
                  </motion.div>
                )}

                {/* ERROR STAGE */}
                {stage === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.28 }}
                    className="flex flex-col items-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-5">
                      <AlertCircle size={26} className="text-red-400" strokeWidth={1.2} />
                    </div>
                    <p className="text-[12px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] text-center leading-relaxed mb-7 max-w-[340px]">
                      {errorMessage}
                    </p>
                    <button
                      type="button"
                      onClick={() => setStage('upload')}
                      className="w-full py-4 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all duration-300 rounded-md flex items-center justify-center gap-2.5 uppercase"
                    >
                      <RefreshCw size={14} strokeWidth={2} />
                      Try Again
                    </button>
                  </motion.div>
                )}

                {/* RESULT STAGE */}
                {stage === 'result' && generatedImage && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -14 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    {/* Success badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="flex justify-center mb-5"
                    >
                      <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/22 rounded-full px-4 py-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" strokeWidth={2} />
                        <span className="text-[10px] font-plex-mono text-emerald-400 tracking-[0.2em] uppercase font-medium">
                          Try-On Generated
                        </span>
                      </div>
                    </motion.div>

                    {/* Generated image container */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                      className="relative w-full rounded-xl overflow-hidden border border-[var(--theme-accent)]/22 bg-[var(--theme-surface)] mb-2"
                      style={{ boxShadow: '0 0 44px rgba(var(--theme-accent-rgb),0.07), 0 16px 36px rgba(0,0,0,0.45)' }}
                    >
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[rgba(var(--theme-accent-rgb),0.6)] to-transparent" />
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-[rgba(var(--theme-accent-rgb),0.6)] to-transparent" />
                      </div>
                      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-[rgba(var(--theme-accent-rgb),0.6)] to-transparent" />
                        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-[rgba(var(--theme-accent-rgb),0.6)] to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-[rgba(var(--theme-accent-rgb),0.4)] to-transparent" />
                        <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-[rgba(var(--theme-accent-rgb),0.4)] to-transparent" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-[rgba(var(--theme-accent-rgb),0.4)] to-transparent" />
                        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-[rgba(var(--theme-accent-rgb),0.4)] to-transparent" />
                      </div>

                      <img
                        src={generatedImage}
                        alt="AI Try-On Result"
                        className="w-full object-contain max-h-[400px]"
                      />

                      {/* Bottom gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[rgba(var(--theme-bg-rgb),0.5)] to-transparent pointer-events-none" />

                      {/* Download button */}
                      <button
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 z-10 bg-[var(--theme-bg)]/75 backdrop-blur-sm border border-[rgba(var(--theme-accent-rgb),0.3)] text-[var(--theme-accent)] p-2.5 rounded-full hover:bg-[var(--theme-accent)]/15 hover:border-[var(--theme-accent)]/60 transition-all duration-200"
                        title="Download"
                      >
                        <Download size={14} strokeWidth={1.5} />
                      </button>
                    </motion.div>

                    {/* Disclaimer */}
                    <p className="text-center text-[10px] font-plex-mono text-[var(--theme-text)]/22 tracking-[0.12em] uppercase mb-6 mt-2">
                      AI-generated preview — actual fit may vary
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[rgba(var(--theme-text-rgb),0.08)] to-transparent mb-5" />

                    {/* Regenerate button */}
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="w-full py-3.5 border border-[var(--theme-accent)]/32 text-[var(--theme-accent)] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:bg-[var(--theme-accent)]/7 hover:border-[var(--theme-accent)]/55 transition-all duration-300 rounded-md flex items-center justify-center gap-2.5 uppercase group"
                    >
                      <RefreshCw
                        size={13}
                        strokeWidth={2}
                        className="group-hover:rotate-180 transition-transform duration-500"
                      />
                      Try a Different Photo
                    </button>

                    {/* ── Share Your Experience ── */}
                    <div className="mt-5">
                      {reviewSubmitted ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center justify-center gap-2.5 py-3.5 bg-emerald-500/10 border border-emerald-500/22 rounded-md"
                        >
                          <CheckCircle2 size={14} className="text-emerald-400" strokeWidth={2} />
                          <span className="text-[10px] font-plex-mono text-emerald-400 tracking-[0.2em] uppercase font-medium">
                            Review submitted — thank you!
                          </span>
                        </motion.div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => setShowReviewForm((v) => !v)}
                            className="w-full flex items-center justify-between py-3 px-4 border border-[rgba(var(--theme-text-rgb),0.1)] rounded-md hover:border-[rgba(var(--theme-accent-rgb),0.3)] transition-colors group"
                          >
                            <span className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] tracking-[0.2em] uppercase group-hover:text-[var(--theme-accent)] transition-colors">
                              ✦ Share Your Experience
                            </span>
                            <ChevronDown
                              size={13}
                              strokeWidth={1.5}
                              className={`text-[rgba(var(--theme-text-rgb),0.35)] group-hover:text-[var(--theme-accent)] transition-all duration-300 ${
                                showReviewForm ? 'rotate-180' : ''
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {showReviewForm && (
                              <motion.div
                                key="review-form"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 space-y-4">
                                  {/* Star rating */}
                                  <div>
                                    <span className="text-[9px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] tracking-[0.25em] uppercase block mb-2">
                                      Your Rating
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      {[1, 2, 3, 4, 5].map((n) => (
                                        <button
                                          key={n}
                                          type="button"
                                          onMouseEnter={() => setReviewHoverRating(n)}
                                          onMouseLeave={() => setReviewHoverRating(0)}
                                          onClick={() => setReviewRating(n)}
                                        >
                                          <Star
                                            size={18}
                                            strokeWidth={1.2}
                                            className={`transition-colors duration-150 ${
                                              n <= (reviewHoverRating || reviewRating)
                                                ? 'text-[var(--theme-accent)] fill-[var(--theme-accent)]'
                                                : 'text-[rgba(var(--theme-text-rgb),0.2)]'
                                            }`}
                                          />
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Comment */}
                                  <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="How did the outfit look? Share your thoughts…"
                                    maxLength={1000}
                                    rows={3}
                                    className="w-full bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-lg p-3.5 text-[12px] font-plex-mono text-[var(--theme-text)]/80 placeholder:text-[rgba(var(--theme-text-rgb),0.25)] focus:outline-none focus:border-[var(--theme-accent)]/45 transition-colors resize-none"
                                  />

                                  {/* Attached image preview */}
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-11 h-11 rounded-lg overflow-hidden border border-[rgba(var(--theme-accent-rgb),0.25)] flex-shrink-0">
                                      <img src={generatedImage!} alt="Try-on" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="text-[9px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.35)] tracking-[0.12em] uppercase">
                                      Your try-on photo will be attached
                                    </span>
                                  </div>

                                  {reviewError && (
                                    <p className="text-[10px] font-plex-mono text-red-400">{reviewError}</p>
                                  )}

                                  <button
                                    type="button"
                                    onClick={handleReviewSubmit}
                                    disabled={reviewSubmitting || reviewRating === 0}
                                    className="w-full py-3 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] font-bold tracking-[0.25em] font-plex-mono hover:brightness-110 transition-all duration-300 rounded-md disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase"
                                  >
                                    {reviewSubmitting ? (
                                      <div className="w-3.5 h-3.5 border border-[var(--theme-bg)]/30 border-t-[var(--theme-bg)] rounded-full animate-spin" />
                                    ) : (
                                      <Send size={11} strokeWidth={2} />
                                    )}
                                    {reviewSubmitting ? 'Submitting…' : 'Submit Review'}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
