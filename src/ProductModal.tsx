'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Minus, Plus, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCart, MAX_QTY_PER_SIZE } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/UseAuth';
import { isSoftToy, formatSoftToySize } from './utils/sizeFormatter';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './components/ui/dialog';
import { Button } from './components/ui/button';

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
  const router = useRouter();

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
      category: product.category || 'unknown',
    });

    if (addedQty === 0) {
      setQtyLimitNote(true);
      setTimeout(() => setQtyLimitNote(false), 2500);
      return;
    }

    onClose();
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
    router.push('/checkout');
  };

  const currentImg =
    activeImage === 'front'
      ? product.frontImg
      : activeImage === 'back'
      ? product.backImg
      : product.topImg;

  const availableImages: { type: 'front' | 'back' | 'top'; url: string }[] = [];
  if (product.frontImg) availableImages.push({ type: 'front', url: product.frontImg });
  if (product.backImg && product.backImg !== product.frontImg)
    availableImages.push({ type: 'back', url: product.backImg });
  if (
    product.topImg &&
    product.topImg !== product.frontImg &&
    product.topImg !== product.backImg
  )
    availableImages.push({ type: 'top', url: product.topImg });

  const currentIndex = availableImages.findIndex((img) => img.type === activeImage);

  const handleNextImage = () => {
    if (availableImages.length <= 1) return;
    const nextIdx = (currentIndex + 1) % availableImages.length;
    setActiveImage(availableImages[nextIdx].type);
  };

  const handlePrevImage = () => {
    if (availableImages.length <= 1) return;
    const prevIdx =
      (currentIndex - 1 + availableImages.length) % availableImages.length;
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
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border border-[rgba(var(--theme-accent-rgb),0.25)] bg-[var(--theme-bg)] text-[var(--theme-text)] rounded-sm max-h-[95vh] md:max-h-[90vh] z-[100] gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.label}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col md:flex-row w-full h-full max-h-[95vh] md:max-h-[90vh] overflow-hidden">
          {/* Left Column: Image Gallery */}
          <div className="w-full md:w-1/2 flex flex-col bg-[var(--theme-surface)] shrink-0 border-b md:border-b-0 md:border-r border-[rgba(var(--theme-accent-rgb),0.1)]">
            <div
              className="relative h-[40vh] md:h-[540px] w-full overflow-hidden shrink-0 group"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {currentImg ? (
                <Image
                  src={currentImg}
                  alt={`${product.name} ${activeImage}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[rgba(var(--theme-text-rgb),0.2)] font-sans tracking-widest uppercase text-sm">
                  Image Unavailable
                </div>
              )}

              {availableImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors duration-300 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-colors duration-300 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {availableImages.length > 1 && (
              <div className="flex p-3 gap-3 bg-[var(--theme-bg)] border-t border-[rgba(var(--theme-accent-rgb),0.1)] overflow-x-auto">
                {availableImages.map((img) => (
                  <button
                    key={img.type}
                    onClick={() => setActiveImage(img.type)}
                    className={`relative w-16 aspect-[3/4] shrink-0 rounded-xs overflow-hidden border-2 transition-colors cursor-pointer ${
                      activeImage === img.type
                        ? 'border-[var(--theme-accent)]'
                        : 'border-transparent hover:border-[rgba(var(--theme-text-rgb),0.3)]'
                    }`}
                  >
                    <Image fill sizes="64px" src={img.url} alt={img.type} className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Details */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[var(--theme-accent)] mb-2 block">
                {product.label}
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-archivo font-bold tracking-[0.1em] text-[var(--theme-text)] uppercase leading-tight mb-2">
                {product.name}
              </h2>
              <p className="text-lg font-mono text-[var(--theme-accent)]">
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(product.price)}
              </p>
            </div>

            {/* Size Selector */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
                  Size
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {(product.sizes || DEFAULT_SIZES).map((size) => {
                  const isLongSize = size.length > 3;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`transition-all duration-300 border cursor-pointer ${
                        isLongSize
                          ? 'flex items-center justify-center text-center px-4 tracking-[0.5px] rounded-xs box-border overflow-hidden whitespace-nowrap w-[130px] md:w-[140px] h-[44px] text-[15px] font-sans font-light'
                          : 'py-2 px-3 text-[12px] font-mono min-w-[3rem] rounded-xs'
                      } ${
                        selectedSize === size
                          ? 'border-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.12)] text-[var(--theme-accent)]'
                          : 'border-[rgba(var(--theme-text-rgb),0.2)] text-[rgba(var(--theme-text-rgb),0.7)] hover:border-[rgba(var(--theme-text-rgb),0.5)]'
                      }`}
                    >
                      {isSoftToy(product?.category) ? formatSoftToySize(size) : size}
                    </button>
                  );
                })}
              </div>
              {!selectedSize && (
                <p className="text-[10px] font-plex-mono text-[var(--theme-accent)] mt-2 tracking-wider">
                  Please select a size
                </p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-2 block">
                  Quantity
                </span>
                <div className="flex items-center border border-[rgba(var(--theme-accent-rgb),0.3)] rounded-xs w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-accent)] transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-mono text-[13px]">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(MAX_QTY_PER_SIZE, quantity + 1))}
                    disabled={quantity >= MAX_QTY_PER_SIZE}
                    className="p-2.5 text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-accent)] transition-colors disabled:opacity-30 cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] mt-1.5">
                  {qtyLimitNote
                    ? `Max ${MAX_QTY_PER_SIZE} per size already in your bag.`
                    : `Limit ${MAX_QTY_PER_SIZE} per size`}
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] mb-1 block">
                  Total
                </span>
                <span className="text-xl font-archivo font-bold text-[var(--theme-accent)]">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(product.price * quantity)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 mt-auto pt-4 border-t border-[rgba(var(--theme-accent-rgb),0.15)]">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                variant="default"
                className="w-full h-12"
              >
                <ShoppingCart size={16} className="mr-2" />
                Add to Bag
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={!selectedSize}
                variant="outline"
                className="w-full h-12"
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
