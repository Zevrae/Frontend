import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud, RefreshCw, Download, CheckCircle2, Sparkles } from 'lucide-react';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Stage = 'upload' | 'generating' | 'result';

export default function TryOnModal({ isOpen, onClose }: TryOnModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('upload');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setGeneratedImage(null);
      setStage('upload');
      setProgress(0);
    }
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setGeneratedImage(null);
      setStage('upload');
    }
  };

  // Simulate generation — replace with real API call later
  const handleGenerate = () => {
    if (!selectedImage) return;
    setStage('generating');
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) { clearInterval(interval); return 95; }
        return prev + Math.random() * 7 + 2;
      });
    }, 130);

    // TODO: replace with real backend call — using selectedImage as placeholder result
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setGeneratedImage(selectedImage);
      setStage('result');
    }, 3400);
  };

  const handleRegenerate = () => {
    setGeneratedImage(null);
    setStage('upload');
    setProgress(0);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = 'zevrae-tryon.jpg';
    a.click();
  };

  const clampedProgress = Math.min(Math.round(progress), 100);

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
            className="relative w-full max-w-[500px] bg-[#12100C] border border-[#C5A059]/35 rounded-[18px] shadow-[0_0_60px_rgba(197,160,89,0.12),0_24px_60px_rgba(0,0,0,0.55)] max-h-[92vh] overflow-y-auto"
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A059]/55 to-transparent rounded-t-[18px]" />

            <div className="p-8 md:p-10">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-[#EAE6E1]/40 hover:text-[#C5A059] transition-colors focus:outline-none z-10"
              >
                <X size={22} strokeWidth={1} />
              </button>

              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-[10px] font-plex-mono font-light tracking-[0.45em] text-[#C5A059] mb-3 uppercase">
                  Virtual Try-On
                </p>
                <h2 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.08em] uppercase text-[#EAE6E1]">
                  See It On You
                </h2>
                <p className="text-[11px] font-plex-mono tracking-[0.05em] text-[#EAE6E1]/40 mt-3">
                  {stage === 'result'
                    ? 'Your AI-generated try-on is ready.'
                    : 'Upload a photo to see how this piece fits.'}
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
                    <div className="mb-6">
                      {!selectedImage ? (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-64 border-2 border-dashed border-[#C5A059]/25 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#C5A059]/55 hover:bg-[#C5A059]/[0.03] transition-all duration-300 bg-[#1A1814]"
                        >
                          <div className="w-14 h-14 rounded-full bg-[#C5A059]/10 flex items-center justify-center mb-4">
                            <UploadCloud size={26} className="text-[#C5A059]/65" strokeWidth={1.2} />
                          </div>
                          <span className="text-[12px] font-plex-mono text-[#EAE6E1]/60 tracking-[0.15em] uppercase">
                            Click to upload photo
                          </span>
                          <span className="text-[10px] font-plex-mono text-[#EAE6E1]/30 mt-2 tracking-wide">
                            JPG, PNG up to 5MB
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-64 rounded-xl overflow-hidden relative border border-[#C5A059]/30 bg-[#1A1814] flex items-center justify-center">
                          <img
                            src={selectedImage}
                            alt="Preview"
                            className="max-w-full max-h-full object-contain"
                          />
                          <button
                            onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                            className="absolute top-3 right-3 bg-[#12100C]/80 hover:bg-[#12100C] p-1.5 rounded-full text-[#EAE6E1]/60 hover:text-[#EAE6E1] transition-all border border-[#EAE6E1]/10"
                          >
                            <X size={14} strokeWidth={1.5} />
                          </button>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-[#12100C]/70 backdrop-blur-sm text-[#C5A059] text-[10px] font-plex-mono tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-[#C5A059]/30 hover:bg-[#C5A059]/10 transition-all"
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
                      disabled={!selectedImage}
                      onClick={handleGenerate}
                      className="w-full py-4 bg-[#C5A059] text-[#12100C] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:bg-[#d4af37] transition-all duration-300 rounded-md disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 uppercase"
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
                    <div className="relative w-full h-72 rounded-xl overflow-hidden bg-[#1A1814] border border-[#C5A059]/20 mb-7">
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
                          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-[#C5A059]/10 to-transparent -skew-x-12"
                        />
                      </div>
                      {/* Progress ring */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div className="relative w-16 h-16">
                          <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
                            <circle cx="32" cy="32" r="28" fill="none" stroke="#C5A059" strokeOpacity="0.12" strokeWidth="2.5" />
                            <motion.circle
                              cx="32" cy="32" r="28"
                              fill="none"
                              stroke="#C5A059"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * 28}`}
                              strokeDashoffset={`${2 * Math.PI * 28 * (1 - clampedProgress / 100)}`}
                              transition={{ ease: 'easeOut', duration: 0.25 }}
                            />
                          </svg>
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-plex-mono text-[#C5A059] font-bold">
                            {clampedProgress}%
                          </span>
                        </div>
                        <p className="text-[11px] font-plex-mono text-[#EAE6E1]/45 tracking-[0.2em] uppercase">
                          Crafting your look…
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-[1.5px] bg-[#EAE6E1]/8 rounded-full overflow-hidden mb-3">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#C5A059]/50 to-[#C5A059]"
                        style={{ width: `${clampedProgress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.25 }}
                      />
                    </div>
                    <p className="text-[10px] font-plex-mono text-[#EAE6E1]/28 tracking-[0.15em] uppercase text-center">
                      AI is styling you — this takes a few seconds
                    </p>
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
                      className="relative w-full rounded-xl overflow-hidden border border-[#C5A059]/22 bg-[#1A1814] mb-2"
                      style={{ boxShadow: '0 0 44px rgba(197,160,89,0.07), 0 16px 36px rgba(0,0,0,0.45)' }}
                    >
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[#C5A059]/60 to-transparent" />
                        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-[#C5A059]/60 to-transparent" />
                      </div>
                      <div className="absolute top-0 right-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-[#C5A059]/60 to-transparent" />
                        <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-[#C5A059]/60 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 left-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-[#C5A059]/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 h-full w-px bg-gradient-to-t from-[#C5A059]/40 to-transparent" />
                      </div>
                      <div className="absolute bottom-0 right-0 w-12 h-12 pointer-events-none z-10">
                        <div className="absolute bottom-0 right-0 w-full h-px bg-gradient-to-l from-[#C5A059]/40 to-transparent" />
                        <div className="absolute bottom-0 right-0 h-full w-px bg-gradient-to-t from-[#C5A059]/40 to-transparent" />
                      </div>

                      <img
                        src={generatedImage}
                        alt="AI Try-On Result"
                        className="w-full object-contain max-h-[400px]"
                      />

                      {/* Bottom gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#12100C]/50 to-transparent pointer-events-none" />

                      {/* Download button */}
                      <button
                        onClick={handleDownload}
                        className="absolute bottom-4 right-4 z-10 bg-[#12100C]/75 backdrop-blur-sm border border-[#C5A059]/30 text-[#C5A059] p-2.5 rounded-full hover:bg-[#C5A059]/15 hover:border-[#C5A059]/60 transition-all duration-200"
                        title="Download"
                      >
                        <Download size={14} strokeWidth={1.5} />
                      </button>
                    </motion.div>

                    {/* Disclaimer */}
                    <p className="text-center text-[10px] font-plex-mono text-[#EAE6E1]/22 tracking-[0.12em] uppercase mb-6 mt-2">
                      AI-generated preview — actual fit may vary
                    </p>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-[#EAE6E1]/8 to-transparent mb-5" />

                    {/* Regenerate button */}
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="w-full py-3.5 border border-[#C5A059]/32 text-[#C5A059] text-[11px] font-bold tracking-[0.25em] font-plex-mono hover:bg-[#C5A059]/7 hover:border-[#C5A059]/55 transition-all duration-300 rounded-md flex items-center justify-center gap-2.5 uppercase group"
                    >
                      <RefreshCw
                        size={13}
                        strokeWidth={2}
                        className="group-hover:rotate-180 transition-transform duration-500"
                      />
                      Try a Different Photo
                    </button>
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
