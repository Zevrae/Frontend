import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useAuth } from './hooks/UseAuth';
import { productsApi } from './api/products';
import TryOn from './components/TryOn';
import TryOnModal from './components/TryOnModal';
import ReviewSection from './components/ReviewSection';
import PinterestCard from './components/PinterestCard';
import './components/PinterestCard.css';
import { useDocumentTitle } from './hooks/useDocumentTitle';

type ProductDetail = {
  id: string;
  name: string;
  price: number;
  label?: string;
  category?: string;
  type?: string;
  sizes?: string[];
  size_stock?: Record<string, number>;
  stock_quantity?: number;
  frontImg: string;
  backImg?: string;
  description?: string;
  originalPrice?: number;
  discount?: number;
  images?: string[];
};

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

// Legacy hardcoded details (Kept as a fallback for older products)
const MATERIALS = [
  { label: 'Composition', value: '100% Premium Cotton — 240 GSM oversized fit' },
  { label: 'Origin', value: 'Ethically produced in limited quantities' },
  { label: 'Finish', value: 'Enzyme-washed for a lived-in softness' },
];

const FIT_NOTES = [
  'Oversized silhouette — size down for a relaxed fit',
  'Drop shoulders, extended hem',
  'Crew neck collar with double stitching',
];

const CARE = [
  'Machine wash cold, inside out',
  'Do not tumble dry',
  'Iron on low heat, avoid print',
  'Do not bleach',
];

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-[#EAE6E1]/10">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/70 group-hover:text-[#C8A96A] transition-colors duration-300">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-[#EAE6E1]/40 group-hover:text-[#C8A96A] transition-colors duration-300"
        >
          <Plus size={14} strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const { token, user } = useAuth();
  
  const [product, setProduct] = useState<ProductDetail | null>(
    (location.state as { product?: ProductDetail } | null)?.product || null
  );

  useDocumentTitle(
    product?.name,
    product
      ? `${product.name} — ${product.label || 'ZEVRAE'}. ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}. Shop now with virtual try-on.`
      : undefined
  );

  const [selectedSize, setSelectedSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  // ─── HYDRATE PRODUCT IF DATA IS INCOMPLETE ───
  useEffect(() => {
    const hydrateProduct = async () => {
      if (!params.id) return;
      try {
        // Fetch with a higher limit to prevent pagination misses
        const { data } = await productsApi.list({ limit: 500 });
        
        // Loose comparison to handle String/Int and id/$id mismatches natively
        const p: any = (data as any[]).find((item: any) => String(item.id) === String(params.id) || String(item.$id) === String(params.id));
        
        if (p) {
          // Safely parse backend images (handles Array, JSON string, or CSV formats)
          let parsedImages: string[] = [];
          if (Array.isArray(p.images)) {
            parsedImages = p.images;
          } else if (typeof p.images === 'string') {
            try { 
              parsedImages = JSON.parse(p.images); 
            } catch { 
              parsedImages = p.images.split(',').map((s: string) => s.trim()); 
            }
          }

          setProduct(prev => ({
            ...prev,
            id: p.id || p.$id || params.id,
            name: p.name || prev?.name || '',
            price: p.price || prev?.price || 0,
            originalPrice: p.compare_price || prev?.originalPrice,
            label: p.category ? `${p.category} Premium` : prev?.label,
            category: p.category?.toLowerCase() || prev?.category,
            type: p.subcategory?.toLowerCase() || prev?.type,
            sizes: p.sizes || prev?.sizes || [],
            size_stock: p.size_stock || prev?.size_stock || {},
            stock_quantity: p.stock_quantity ?? prev?.stock_quantity,
            discount: p.discount || (p.compare_price && p.compare_price > p.price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : prev?.discount),
            frontImg: parsedImages[0] || prev?.frontImg || '',
            backImg: parsedImages[1] || parsedImages[0] || prev?.backImg || '',
            images: parsedImages.length > 0 ? parsedImages : (prev?.images || []),
            description: p.description || prev?.description
          }));
        }
      } catch (e) {
        console.error("Failed to hydrate product", e);
      }
    };

    const routeProduct = (location.state as any)?.product;
    if (routeProduct) {
      setProduct(routeProduct);
    }
    
    // Unconditionally hydrate in the background to guarantee full images array
    hydrateProduct();
  }, [params.id, location.state]);

  // ─── AGGRESSIVE IMAGE DEDUPLICATION ───
  const images = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    
    // Always start with front and back images if they exist
    if (product.frontImg) imgs.push(product.frontImg);
    if (product.backImg) imgs.push(product.backImg);
    
    // Push the full array from backend safely
    if (product.images && Array.isArray(product.images)) {
      imgs.push(...product.images);
    } else if (typeof product.images === 'string') {
      try { 
        imgs.push(...JSON.parse(product.images)); 
      } catch (e) {
        // Silent catch for bad formats
      }
    }
    
    // Convert to Set to remove duplicates, and filter out empty strings
    return Array.from(new Set(imgs)).filter(img => typeof img === 'string' && img.trim() !== '');
  }, [product]);

  // ─── PARSE RICH TEXT INTO ACCORDIONS ───
  const parsedDescriptionSections = useMemo(() => {
    if (!product?.description) return null;
    
    if (!product.description.includes('<h2>')) {
      return [{ title: 'Details', content: product.description }];
    }

    const parts = product.description.split('<h2>');
    const sections: { title: string; content: string }[] = [];

    if (parts[0].trim()) {
      sections.push({ title: 'Details', content: parts[0].trim() });
    }

    for (let i = 1; i < parts.length; i++) {
      const closeIdx = parts[i].indexOf('</h2>');
      if (closeIdx !== -1) {
        const rawTitle = parts[i]
          .substring(0, closeIdx)
          .replace(/<[^>]*>?/gm, '')
          .replace(/&amp;/gi, '&')
          .trim();

        sections.push({
          title: rawTitle,
          content: parts[i].substring(closeIdx + 5).trim()
        });
      }
    }
    
    return sections.length > 0 ? sections : null;
  }, [product?.description]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSizeError(false);
    setQuantity(1);
    setActiveImg(0);
    setAdded(false);
    // For jewellery & accessories, size is irrelevant — auto-select 'One Size'
    const cat = (product?.category || '').toLowerCase();
    const isNonApparel = cat === 'jewellery' || cat === 'accessories' ||
      ['rings','pendants','ears','bracelets','keychains','soft toys'].includes(cat);
    setSelectedSize(isNonApparel ? 'One Size' : '');
  }, [params.id, product?.category]);

  // Fetch related products
  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const { data } = await productsApi.list({ status: 'active', limit: 100 });
        const related = (data || [])
          .filter(
            (p: any) =>
              p.id !== product.id &&
              (p.category?.toLowerCase() === product.category ||
                p.subcategory?.toLowerCase() === product.type)
          )
          .slice(0, 4)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.compare_price,
            label: `${p.category} Premium`,
            category: p.category?.toLowerCase(),
            type: p.subcategory?.toLowerCase(),
            sizes: p.sizes,
            discount: p.discount || (p.compare_price && p.compare_price > p.price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : undefined),
            frontImg: p.images?.[0] || '',
            backImg: p.images?.[1] || p.images?.[0] || '',
            images: p.images || [], // Included to pass all images to the next view
            description: p.description
          }));
        setRelatedProducts(related);
      } catch {}
    };
    fetchRelated();
  }, [product]);

  const switchImage = (index: number) => {
    if (index === activeImg) return;
    setImgLoaded(false);
    setActiveImg(index);
  };

  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyStatus, setNotifyStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [notifyError, setNotifyError] = useState('');

  const handleNotifyMe = async () => {
    if (!product) return;
    const email = user?.email || notifyEmail.trim();
    if (!email) {
      setNotifyError('Enter your email to get notified.');
      return;
    }
    setNotifyStatus('submitting');
    setNotifyError('');
    try {
      await productsApi.notifyMe(product.id, {
        email: user ? undefined : email,
        size: isNoSizeProduct ? undefined : selectedSize,
      });
      setNotifyStatus('done');
    } catch (err: any) {
      setNotifyStatus('error');
      setNotifyError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  // Reset the notify form whenever the shopper picks a different size, so a
  // stale "you're signed up" message from a previous size doesn't linger.
  useEffect(() => {
    setNotifyStatus('idle');
    setNotifyError('');
  }, [selectedSize]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.frontImg,
      category: product.category || 'unknown',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || !selectedSize) return;
    if (!token) {
      setIsLoginModalOpen(true);
      return;
    }
    handleAddToCart();
    navigate('/checkout');
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#12100C] text-[#EAE6E1] flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]">Loading product...</p>
        </div>
      </div>
    );
  }

  const availableSizes = product.sizes?.length ? product.sizes : [];
  const sizeStock = product.size_stock || {};
  const isNoSizeProduct = availableSizes.length === 0;
  // A size the product offers at all, but currently has zero stock for —
  // distinct from a size the product simply doesn't come in.
  const isSizeOutOfStock = (size: string) => (sizeStock[size] ?? 0) <= 0;
  const overallInStock = isNoSizeProduct
    ? (product.stock_quantity ?? 0) > 0
    : availableSizes.some(s => !isSizeOutOfStock(s));
  const showNotifyMe = isNoSizeProduct
    ? !overallInStock
    : !!selectedSize && isSizeOutOfStock(selectedSize);

  return (
    <div className="min-h-screen bg-[#12100C] text-[#EAE6E1] font-sans selection:bg-[#C8A96A]/30 selection:text-[#EAE6E1]">
      {/* Film grain overlay */}
      <div
        className="fixed inset-0 opacity-[0.018] pointer-events-none z-[1] mix-blend-difference"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />

      {/* ── MAIN PRODUCT AREA ── */}
      <main className="relative z-10 pt-28 md:pt-32 pb-0">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">

          {/* Back link */}
          <motion.button
            onClick={() => navigate(-1)}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] font-plex-mono text-[#EAE6E1]/40 hover:text-[#C8A96A] transition-colors duration-300 mb-12 group"
          >
            <ChevronLeft size={12} className="group-hover:-translate-x-0.5 transition-transform duration-300" />
            {product.label || 'Back to Collection'}
          </motion.button>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_480px] gap-10 lg:gap-20 items-start">

            {/* ── LEFT: GALLERY ── */}
            <div ref={galleryRef} className="flex flex-col gap-4 lg:gap-5">

              {/* Primary image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full aspect-[4/5] bg-[#0d0d0d] overflow-hidden"
              >
                {/* Discount badge */}
                {product.discount && (
                  <div className="absolute top-5 right-5 z-10 px-3 py-1.5 bg-[#C8A96A] text-[#12100C] text-[9px] uppercase tracking-[0.2em] font-bold font-plex-mono">
                    {product.discount}% OFF
                  </div>
                )}

                {/* Main image with fade */}
                <img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  loading="eager"
                  decoding="async"
                  onLoad={() => setImgLoaded(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 400ms ease',
                  }}
                />

                {/* Subtle vignette */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.35) 0%, transparent 65%)',
                  }}
                />

                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-5 right-5 text-[9px] font-plex-mono text-[#EAE6E1]/50 tracking-[0.2em]">
                    {String(activeImg + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </div>
                )}
              </motion.div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex gap-3"
                >
                  {images.map((img, i) => (
                    <button
                      key={i}
                      id={`thumbnail-${i}`}
                      onClick={() => switchImage(i)}
                      className={`relative flex-shrink-0 w-[72px] h-[90px] bg-[#0d0d0d] overflow-hidden transition-all duration-300 ${
                        activeImg === i
                          ? 'ring-1 ring-[#C8A96A] opacity-100'
                          : 'opacity-50 hover:opacity-80 ring-1 ring-transparent hover:ring-[#EAE6E1]/20'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`View ${i + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* ── RIGHT: STICKY INFO PANEL ── */}
            <div className="lg:sticky lg:top-28 flex flex-col gap-8">

              {/* Product name + price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-5"
              >
                {/* Category label + TryOn row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0' }}>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-plex-mono text-[#C8A96A]" style={{ margin: 0 }}>
                    {product.label || "Men's Collection"}
                  </p>
                  <TryOn onClick={() => setTryOnOpen(true)} />
                </div>

                <h1
                  className="font-archivo font-extrabold uppercase text-[#EAE6E1] leading-[0.9] tracking-[-0.01em]"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontStretch: '125%' }}
                >
                  {product.name}
                </h1>

                {/* Price row */}
                <div className="flex items-baseline gap-4 pt-1">
                  <span className="text-2xl font-plex-mono text-[#EAE6E1]">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm font-plex-mono text-[#EAE6E1]/30 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
              </motion.div>

              {/* Divider */}
              <div className="h-px bg-[#EAE6E1]/8" />

              {/* Size selector — hidden for jewellery & accessories */}
              {(() => {
                const cat = (product.category || '').toLowerCase();
                const isNonApparel = cat === 'jewellery' || cat === 'accessories' ||
                  ['rings','pendants','ears','bracelets','keychains','soft toys'].includes(cat);
                if (isNonApparel) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/50">
                        Size
                      </span>
                      <button 
                        className="text-[10px] uppercase tracking-[0.15em] font-plex-mono text-[#EAE6E1]/30 hover:text-[#C8A96A] transition-colors duration-300 underline underline-offset-4" 
                        onClick={() => navigate('/size-guide')}
                      >
                        Size Guide
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {DEFAULT_SIZES.map((size) => {
                        const isOffered = availableSizes.includes(size);
                        const outOfStock = isOffered && isSizeOutOfStock(size);
                        return (
                        <button
                          key={size}
                          id={`size-${size}`}
                          onClick={() => {
                            if (isOffered) {
                              setSelectedSize(size);
                              setSizeError(false);
                            } else {
                              setSizeError(true);
                            }
                          }}
                          className={`relative min-w-[3.2rem] px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-plex-mono transition-all duration-200 border ${
                            selectedSize === size
                              ? 'border-[#C8A96A] text-[#C8A96A] bg-[#C8A96A]/8'
                              : !isOffered
                                ? 'border-[#EAE6E1]/12 text-[#EAE6E1]/20 cursor-not-allowed opacity-50'
                                : outOfStock
                                  ? 'border-[#EAE6E1]/12 text-[#EAE6E1]/30 hover:border-[#EAE6E1]/30'
                                  : 'border-[#EAE6E1]/12 text-[#EAE6E1]/50 hover:border-[#EAE6E1]/35 hover:text-[#EAE6E1]/80'
                          }`}
                        >
                          <span className={outOfStock ? 'line-through decoration-[#EAE6E1]/30' : ''}>{size}</span>
                        </button>
                        );
                      })}
                    </div>
                    <AnimatePresence>
                      {sizeError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="text-[10px] tracking-[0.2em] font-plex-mono text-red-500"
                        >
                          Size not available
                        </motion.p>
                      )}
                      {!selectedSize && !sizeError && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.2 }}
                          className="text-[10px] tracking-[0.2em] font-plex-mono text-[#C8A96A]/70"
                        >
                          Please select a size to continue
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })()}

              {/* Quantity + Total */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/50">
                    Quantity
                  </span>
                  <div className="flex items-center border border-[#EAE6E1]/12 h-10">
                    <button
                      id="qty-minus"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-full flex items-center justify-center text-[#EAE6E1]/50 hover:text-[#C8A96A] hover:bg-[#C8A96A]/5 transition-all duration-200"
                    >
                      <Minus size={12} strokeWidth={1.5} />
                    </button>
                    <span className="w-10 text-center font-plex-mono text-[13px] text-[#EAE6E1] select-none">
                      {quantity}
                    </span>
                    <button
                      id="qty-plus"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-full flex items-center justify-center text-[#EAE6E1]/50 hover:text-[#C8A96A] hover:bg-[#C8A96A]/5 transition-all duration-200"
                    >
                      <Plus size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Total line */}
                <div className="flex items-center justify-between py-3 border-t border-b border-[#EAE6E1]/8">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/40">
                    Total
                  </span>
                  <span className="font-plex-mono text-lg text-[#EAE6E1]">
                    {formatPrice(product.price * quantity)}
                  </span>
                </div>
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col gap-3"
              >
                {showNotifyMe ? (
                  <div className="border border-[#EAE6E1]/12 p-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[#EAE6E1]/60 mb-1">
                      {isNoSizeProduct ? 'Currently Out of Stock' : `Size ${selectedSize} is Out of Stock`}
                    </p>
                    <p className="text-[11px] font-sans text-[#EAE6E1]/40 mb-4">
                      Enter your email and we'll let you know the moment it's back.
                    </p>
                    {notifyStatus === 'done' ? (
                      <p className="text-[11px] font-plex-mono text-[#C8A96A] flex items-center gap-2">
                        You're on the list — we'll email you when it's back in stock.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row gap-2">
                          {!user && (
                            <input
                              type="email"
                              value={notifyEmail}
                              onChange={e => setNotifyEmail(e.target.value)}
                              placeholder="you@example.com"
                              className="flex-1 bg-transparent border border-[#EAE6E1]/15 px-4 py-3 text-[11px] font-plex-mono text-[#EAE6E1] placeholder:text-[#EAE6E1]/25 focus:border-[#C8A96A]/50 focus:outline-none"
                            />
                          )}
                          <button
                            onClick={handleNotifyMe}
                            disabled={notifyStatus === 'submitting'}
                            className="px-6 py-3 bg-[#C8A96A] text-[#12100C] text-[10px] uppercase tracking-[0.2em] font-plex-mono font-bold hover:bg-[#EAE6E1] transition-colors disabled:opacity-50 whitespace-nowrap"
                          >
                            {notifyStatus === 'submitting' ? 'Submitting...' : 'Notify Me'}
                          </button>
                        </div>
                        {notifyError && (
                          <p className="text-[10px] text-red-400 font-sans mt-2">{notifyError}</p>
                        )}
                      </>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Add to bag */}
                    <button
                      id="add-to-bag"
                      onClick={handleAddToCart}
                      disabled={!selectedSize}
                      className={`relative w-full h-[54px] flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.25em] font-plex-mono font-bold overflow-hidden transition-all duration-300 ${
                        selectedSize
                          ? 'bg-[#EAE6E1] text-[#12100C] hover:bg-[#C8A96A] cursor-pointer'
                          : 'bg-[#EAE6E1]/8 text-[#EAE6E1]/25 cursor-not-allowed'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {added ? (
                          <motion.span
                            key="added"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            Added ✓
                          </motion.span>
                        ) : (
                          <motion.span
                            key="add"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                          >
                            <ShoppingBag size={15} strokeWidth={1.8} />
                            Add to Bag
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Buy now */}
                    <button
                      id="buy-now"
                      onClick={handleBuyNow}
                      disabled={!selectedSize}
                      className={`w-full h-[54px] flex items-center justify-center text-[11px] uppercase tracking-[0.25em] font-plex-mono font-bold border transition-all duration-300 ${
                        selectedSize
                          ? 'border-[#C8A96A]/60 text-[#C8A96A] hover:bg-[#C8A96A] hover:text-[#12100C] cursor-pointer'
                          : 'border-[#EAE6E1]/10 text-[#EAE6E1]/20 cursor-not-allowed'
                      }`}
                    >
                      Buy It Now
                    </button>
                  </>
                )}
              </motion.div>

              {/* ── PRODUCT DETAILS (PARSED RICH TEXT OR FALLBACK) ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="pt-2"
              >
                {parsedDescriptionSections ? (
                  // Map the split rich text into Accordions
                  parsedDescriptionSections.map((section, idx) => (
                    <AccordionSection key={idx} title={section.title} defaultOpen={idx === 0}>
                      <div 
                        className="text-[12px] font-plex-mono text-[#EAE6E1]/60 leading-relaxed
                          [&_ul]:space-y-2.5
                          [&_li]:flex [&_li]:items-start [&_li]:gap-3
                          [&_li::before]:content-['—'] [&_li::before]:text-[#C8A96A] [&_li::before]:shrink-0 [&_li::before]:mt-1.5
                          [&_p:not(:last-child)]:mb-3
                          [&_strong]:text-[#EAE6E1]/35 [&_strong]:uppercase [&_strong]:tracking-[0.25em] [&_strong]:text-[10px] [&_strong]:w-28 [&_strong]:shrink-0 [&_strong]:block sm:[&_strong]:inline-block [&_strong]:font-normal"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </AccordionSection>
                  ))
                ) : (
                  // Legacy Fallback for products without rich text descriptions
                  <>
                    <AccordionSection title="Materials & Construction" defaultOpen={true}>
                      <div className="space-y-4">
                        {MATERIALS.map((m) => (
                          <div key={m.label} className="flex gap-6">
                            <span className="text-[10px] uppercase tracking-[0.25em] font-plex-mono text-[#EAE6E1]/35 w-28 shrink-0">
                              {m.label}
                            </span>
                            <span className="text-[12px] font-plex-mono text-[#EAE6E1]/65 leading-relaxed">
                              {m.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionSection>

                    <AccordionSection title="Fit & Sizing">
                      <ul className="space-y-2.5">
                        {FIT_NOTES.map((note) => (
                          <li key={note} className="flex items-start gap-3 text-[12px] font-plex-mono text-[#EAE6E1]/60 leading-relaxed">
                            <span className="text-[#C8A96A] mt-1.5 shrink-0">—</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </AccordionSection>

                    <AccordionSection title="Care Instructions">
                      <ul className="space-y-2.5">
                        {CARE.map((c) => (
                          <li key={c} className="flex items-start gap-3 text-[12px] font-plex-mono text-[#EAE6E1]/60 leading-relaxed">
                            <span className="text-[#C8A96A] mt-1.5 shrink-0">—</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </AccordionSection>

                    <AccordionSection title="Delivery & Returns">
                      <div className="space-y-3 text-[12px] font-plex-mono text-[#EAE6E1]/60 leading-relaxed">
                        <p>Free shipping on orders above ₹999.</p>
                        <p>Dispatched within 2–4 business days. Delivery in 5–8 days.</p>
                        <p>14-day returns accepted on unworn, unaltered items with original tags intact.</p>
                      </div>
                    </AccordionSection>
                  </>
                )}
              </motion.div>
            </div>
            {/* END RIGHT PANEL */}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-32 pt-20 border-t border-[#EAE6E1]/8">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <div className="flex items-end justify-between mb-14">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] font-plex-mono text-[#C8A96A] mb-3">
                    You May Also Like
                  </p>
                  <h2
                    className="font-archivo font-extrabold uppercase text-[#EAE6E1] leading-tight"
                    style={{ fontSize: 'clamp(1.75rem, 3.5vw, 3rem)', fontStretch: '125%' }}
                  >
                    Related Pieces
                  </h2>
                </div>
                <button
                  onClick={() => navigate(-1)}
                  className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/40 hover:text-[#C8A96A] transition-colors duration-300 group"
                >
                  View All
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-300" />
                </button>
              </div>

              <div className="pinterest-grid">
                {relatedProducts.map((p, i) => (
                  <PinterestCard
                    key={p.id}
                    product={p}
                    index={i}
                    onClick={() => navigate(`/product/${p.id}`, { state: { product: p } })}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {product?.id && <ReviewSection productId={product.id} />}

        {/* Footer spacer */}
        <div className="h-32" />
      </main>

      {/* Try On Modal */}
      <TryOnModal
        isOpen={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        productId={product?.id || ''}
        clothImages={images.length > 0 ? images : product?.frontImg ? [product.frontImg] : []}
      />
    </div>
  );
}