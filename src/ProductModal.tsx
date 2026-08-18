import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart, MAX_QTY_PER_SIZE } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/UseAuth';
import { isSoftToy, formatSoftToySize } from './utils/sizeFormatter';

interface Product {
  id: string;
  name: string;
  price: number;
  label: string;
  frontImg: string;
  backImg?: string;
  topImg?: string;
  category?: string;
  sizes?: string[];
  originalPrice?: number;
  discount?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<'front' | 'back' | 'top'>('front');
  const [qtyLimitNote, setQtyLimitNote] = useState(false);
  const { addToCart } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const { token } = useAuth();
  const navigate = useNavigate();

  // Reset state when modal opens with new product
  if (!isOpen) return null;
  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const addedQty = addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity: quantity,
      image: product.frontImg,
      category: product.category || 'unknown'
    });

    if (addedQty === 0) {
      setQtyLimitNote(true);
      setTimeout(() => setQtyLimitNote(false), 2500);
      return;
    }

    onClose();
    // Reset state for next time
    setSelectedSize('');
    setQuantity(1);
    setActiveImage('front');
  };

  const handleBuyNow = () => {
    if (!selectedSize) return;

    if (!token) {
      onClose();
      setIsLoginModalOpen(true);
      return;
    }

    handleAddToCart();
    navigate('/checkout');
  };

  const currentImg = activeImage === 'front' ? product.frontImg : activeImage === 'back' ? product.backImg : product.topImg;

  const availableImages: { type: 'front' | 'back' | 'top', url: string }[] = [];
  if (product.frontImg) availableImages.push({ type: 'front', url: product.frontImg });
  if (product.backImg && product.backImg !== product.frontImg) availableImages.push({ type: 'back', url: product.backImg });
  if (product.topImg && product.topImg !== product.frontImg && product.topImg !== product.backImg) availableImages.push({ type: 'top', url: product.topImg });

  const currentIndex = availableImages.findIndex(img => img.type === activeImage);
  
  const handleNextImage = () => {
    if (availableImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % availableImages.length;
    setActiveImage(availableImages[nextIdx].type);
  };

  const handlePrevImage = () => {
    if (availableImages.length <= 1) return;
    const prevIdx = (currentIndex - 1 + availableImages.length) % availableImages.length;
    setActiveImage(availableImages[prevIdx].type);
  };

  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNextImage();
    } else if (diff < -50) {
      handlePrevImage();
    }
    touchStartX.current = null;
  };

  return (
    <AnimatePresence>
        <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center md:p-4 lg:p-6"
      >
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full h-[100dvh] md:h-auto max-w-5xl bg-[var(--theme-bg)] md:border border-[rgba(var(--theme-accent-rgb),0.1)] rounded-none md:rounded-sm overflow-hidden flex flex-col md:flex-row max-h-[100dvh] md:max-h-[90vh]"
        >
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 z-[60] text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-text)] transition-colors bg-black/60 p-2 rounded-full md:bg-transparent md:p-0"
          >
            <X size={24} />
          </button>

          {/* Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col bg-[var(--theme-surface)] shrink-0">
            <div 
              className="relative h-[45vh] md:h-[600px] w-full overflow-hidden shrink-0 group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {currentImg ? (
                <img 
                  src={currentImg} 
                  alt={`${product.name} ${activeImage}`} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[rgba(var(--theme-text-rgb),0.2)] font-sans tracking-widest uppercase text-sm">
                  Image Unavailable
                </div>
              )}

              {/* Navigation Arrows */}
              {availableImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/40 text-white rounded-full hover:bg-black/70 transition-colors duration-300"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
            
            {/* Thumbnails */}
            <div className="flex p-4 gap-4 bg-[var(--theme-bg)] border-b md:border-t border-[rgba(var(--theme-accent-rgb),0.1)] overflow-x-auto scrollbar-hide">
              <button 
                onClick={() => setActiveImage('front')}
                className={`relative w-20 min-w-[5rem] aspect-[3/4] shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${activeImage === 'front' ? 'border-[var(--theme-accent)]' : 'border-transparent hover:border-[rgba(var(--theme-text-rgb),0.3)]'}`}
              >
                {product.frontImg ? (
                  <img src={product.frontImg} alt="Front" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[var(--theme-surface)] flex items-center justify-center text-[8px] text-[rgba(var(--theme-text-rgb),0.3)] uppercase">Front</div>
                )}
              </button>
              {product.backImg && product.backImg !== product.frontImg && (
                <button 
                  onClick={() => setActiveImage('back')}
                  className={`relative w-20 min-w-[5rem] aspect-[3/4] shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${activeImage === 'back' ? 'border-[var(--theme-accent)]' : 'border-transparent hover:border-[rgba(var(--theme-text-rgb),0.3)]'}`}
                >
                  <img src={product.backImg} alt="Back" className="w-full h-full object-cover" />
                </button>
              )}
              {product.topImg && product.topImg !== product.frontImg && product.topImg !== product.backImg && (
                <button 
                  onClick={() => setActiveImage('top')}
                  className={`relative w-20 min-w-[5rem] aspect-[3/4] shrink-0 rounded-sm overflow-hidden border-2 transition-colors ${activeImage === 'top' ? 'border-[var(--theme-accent)]' : 'border-transparent hover:border-[rgba(var(--theme-text-rgb),0.3)]'}`}
                >
                  <img src={product.topImg} alt="Top" className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2 p-5 sm:p-6 md:p-12 flex flex-col overflow-y-auto pb-[90px] md:pb-12">
            <div className="mb-4 md:mb-8">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[var(--theme-accent)] mb-1 sm:mb-2 block">
                    {product.label}
                  </span>
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-archivo font-bold tracking-[0.1em] text-[var(--theme-text)] uppercase leading-tight mb-1 sm:mb-4">
                    {product.name}
                  </h2>
                  <p className="text-lg sm:text-xl font-mono text-[var(--theme-text)]">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    const url = window.location.origin + '/product/' + product.id;
                    if (navigator.share) {
                      navigator.share({ title: product.name, url }).catch(console.error);
                    } else {
                      navigator.clipboard.writeText(url);
                      alert('Link copied to clipboard!');
                    }
                  }}
                  className="flex items-center justify-center w-10 h-10 mt-4 rounded-full border border-[rgba(var(--theme-text-rgb),0.2)] text-[var(--theme-text)] hover:bg-[var(--theme-text)] hover:text-[var(--theme-bg)] transition-colors shrink-0"
                  title="Share this product"
                  aria-label="Share product"
                >
                  <span className="text-xl leading-none">↗</span>
                </button>
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-5 md:mb-8 mt-2 md:mt-0">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">Size</span>
                <button className="text-[10px] uppercase tracking-[0.1em] text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-text)] underline underline-offset-4">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || DEFAULT_SIZES).map(size => {
                  const isLongSize = size.length > 3;
                  return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`transition-all duration-300 border ${
                      isLongSize 
                        ? 'flex items-center justify-center text-center px-4 tracking-[0.5px] rounded box-border overflow-hidden whitespace-nowrap w-[130px] md:w-[140px] h-[48px] md:h-[52px] text-[16px] md:text-[18px] align-middle font-sans font-light' 
                        : 'py-2 px-3 sm:py-3 sm:px-4 text-[12px] font-mono min-w-[3rem]'
                    } ${
                      selectedSize === size 
                        ? 'border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)] text-[var(--theme-accent)]' 
                        : 'border-[rgba(var(--theme-text-rgb),0.2)] text-[rgba(var(--theme-text-rgb),0.7)] hover:border-[rgba(var(--theme-text-rgb),0.5)]'
                    }`}
                  >
                    {isSoftToy(product?.category) ? formatSoftToySize(size) : size}
                  </button>
                )})}
              </div>
              {!selectedSize && (
                <p className="text-[10px] text-[var(--theme-accent)] mt-2 tracking-wider">Please select a size</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 md:mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2 sm:mb-4 block">Quantity</span>
                <div className="flex items-center border border-[rgba(var(--theme-text-rgb),0.2)] w-fit">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-text-rgb),0.05)] transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-mono text-[13px]">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(MAX_QTY_PER_SIZE, quantity + 1))}
                    disabled={quantity >= MAX_QTY_PER_SIZE}
                    className="p-3 text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-text-rgb),0.05)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <p className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] mt-2">
                  {qtyLimitNote ? `Max ${MAX_QTY_PER_SIZE} per size already in your bag.` : `Limit ${MAX_QTY_PER_SIZE} per size`}
                </p>
              </div>
              
              {/* Total Price (Mobile) / Desktop */}
              <div className="mt-4 sm:mt-0 pt-4 sm:pt-0 sm:ml-auto">
                <div className="hidden md:flex flex-col items-end">
                   <span className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-4 block">Total</span>
                   <span className="text-xl font-mono text-[var(--theme-text)]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price * quantity)}</span>
                </div>
              </div>
            </div>

            {/* Total Price (Desktop fallback) */}
            <div className="md:hidden flex justify-between items-center mb-6 py-4 border-t border-b border-[rgba(var(--theme-text-rgb),0.1)]">
              <span className="text-[12px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">Total</span>
              <span className="text-xl font-mono text-[var(--theme-text)]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price * quantity)}</span>
            </div>

            {/* Actions Desktop */}
            <div className="hidden md:flex flex-col gap-4 mt-auto">
              {!selectedSize && (
                <p className="text-red-400 text-xs font-plex-mono tracking-widest text-center">Please select a size</p>
              )}
              <button 
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full py-4 flex items-center justify-center space-x-3 uppercase tracking-[0.2em] font-bold text-[11px] transition-all duration-300 ${
                  selectedSize 
                    ? 'bg-[var(--theme-text)] text-[var(--theme-bg)] hover:bg-[var(--theme-accent)]' 
                    : 'bg-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.3)] cursor-not-allowed'
                }`}
              >
                <ShoppingCart size={16} strokeWidth={2} />
                <span>Add to Cart</span>
              </button>
              <button 
                onClick={handleBuyNow}
                disabled={!selectedSize}
                className={`w-full py-4 uppercase tracking-[0.2em] font-bold text-[11px] transition-all duration-300 border ${
                  selectedSize 
                    ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-bg)]' 
                    : 'border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.3)] cursor-not-allowed'
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
          
          {/* Actions Mobile Sticky */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 bg-[var(--theme-bg)] border-t border-[rgba(var(--theme-accent-rgb),0.2)] p-4 flex gap-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.8)]">
            <button 
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className={`flex-1 py-3 px-2 flex items-center justify-center space-x-2 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold text-[10px] sm:text-[11px] transition-all duration-300 ${
                selectedSize 
                  ? 'bg-[var(--theme-text)] text-[var(--theme-bg)] hover:bg-[var(--theme-accent)]' 
                  : 'bg-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.3)] cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={14} strokeWidth={2} />
              <span>Add</span>
            </button>
            <button 
              onClick={handleBuyNow}
              disabled={!selectedSize}
              className={`flex-1 py-3 px-2 uppercase tracking-[0.1em] sm:tracking-[0.2em] font-bold text-[10px] sm:text-[11px] transition-all duration-300 border ${
                selectedSize 
                  ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.1)]' 
                  : 'border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.3)] cursor-not-allowed'
              }`}
            >
              Buy Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
