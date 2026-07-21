import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, UploadCloud } from 'lucide-react';

interface TryOnModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TryOnModal({ isOpen, onClose }: TryOnModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
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
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-[500px] bg-[#12100C] border border-[#C5A059]/40 rounded-[16px] shadow-[0_0_40px_rgba(212,175,55,0.1)] p-8 md:p-10 max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-[#EAE6E1]/50 hover:text-[#C5A059] transition-colors focus:outline-none z-10"
            >
              <X size={24} strokeWidth={1} />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-sm font-plex-mono font-light tracking-[0.4em] text-[#C5A059] mb-4 uppercase">
                VIRTUAL TRY ON
              </h1>
              <div className="flex justify-center mb-2">
                <span className="text-xl md:text-2xl font-archivo font-bold tracking-[0.1em] uppercase text-[#EAE6E1]">
                  SEE IT ON YOU
                </span>
              </div>
              <p className="text-[12px] font-plex-mono tracking-[0.05em] text-[#EAE6E1]/50 mt-4">
                Upload a photo to see how this piece fits.
              </p>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 border-2 border-dashed border-[#C5A059]/30 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#C5A059] transition-colors bg-[#1A1814]"
                >
                  <UploadCloud size={48} className="text-[#C5A059]/50 mb-4" strokeWidth={1} />
                  <span className="text-[12px] font-plex-mono text-[#EAE6E1]/70 tracking-wide uppercase">Click to upload photo</span>
                  <span className="text-[10px] font-plex-mono text-[#EAE6E1]/40 mt-2">JPG, PNG up to 5MB</span>
                </div>
              ) : (
                <div className="w-full h-64 rounded-lg overflow-hidden relative border border-[#C5A059]/30 bg-[#1A1814] flex items-center justify-center">
                  <img src={selectedImage} alt="Preview" className="max-w-full max-h-full object-contain" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 bg-[#12100C]/80 hover:bg-[#12100C] p-2 rounded-full text-[#EAE6E1] transition-colors"
                  >
                    <X size={16} />
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
              className="w-full py-4 mt-2 bg-[#C5A059] text-[#12100C] text-[12px] font-bold tracking-[0.2em] font-plex-mono hover:bg-[#d4af37] transition-all duration-300 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              GENERATE PREVIEW
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
