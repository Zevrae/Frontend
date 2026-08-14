import React, { useEffect, useMemo, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
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
    <div className="border-t border-[rgba(var(--theme-text-rgb),0.1)]">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-[11px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)] group-hover:text-[var(--theme-accent)] transition-colors duration-300">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-[rgba(var(--theme-text-rgb),0.4)] group-hover:text-[var(--theme-accent)] transition-colors duration-300"
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

  // ─── UNIFIED NON-APPAREL CHECK ───
  const isNonApparel = useMemo(() => {
    if (!product) return false;
    const cat = (product.category || '').toLowerCase();
    const type = (product.type || '').toLowerCase();
    const nonApparelKeys = ['jewellery', 'accessories', 'rings', 'pendants', 'ears', 'bracelets', 'keychains', 'soft toys', 'earrings'];
    return nonApparelKeys.includes(cat) || nonApparelKeys.includes(type);
  }, [product]);

  // ─── DYNAMIC SIZES EXTRACTION ───
  const availableSizes = useMemo(() => {
    // If it's jewellery or accessories, strictly return empty array to disable sizes
    if (!product || isNonApparel) return [];
    
    let sizes = product.sizes?.length ? product.sizes : Object.keys(product.size_stock || {});
    // Fallback to default apparel sizes if not defined in DB but categorized as apparel
    if (sizes.length === 0) {
      sizes = DEFAULT_SIZES;
    }
    return sizes;
  }, [product, isNonApparel]);

  const requireSizeSelection = availableSizes.length > 0;

  // ─── HYDRATE PRODUCT IF DATA IS INCOMPLETE ───
  useEffect(() => {
    const hydrateProduct = async () => {
      if (!params.id) return;
      try {
        let p: any = null;

        if (typeof (productsApi as any).get === 'function') {
          const res = await (productsApi as any).get(params.id);
          p = res.data || res;
        } else if (typeof (productsApi as any).getById === 'function') {
          const res = await (productsApi as any).getById(params.id);
          p = res.data || res;
        } else {
          let currentPage = 1;
          let hasMore = true;

          while (hasMore) {
            const response: any = await productsApi.list({ limit: 100, page: currentPage });
            const items = response.data || [];
            
            p = items.find((item: any) => String(item.id) === String(params.id) || String(item.$id) === String(params.id));
            
            if (p) break;

            const pagination = response.pagination;
            if (pagination && currentPage >= pagination.pages) {
              hasMore = false;
            } else if (items.length < 100) {
              hasMore = false;
            } else {
              currentPage++;
            }
          }
        }
        
        if (p) {
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
            id: p.id || p.$id || params.id || '',
            name: p.name || prev?.name || '',
            price: p.price || prev?.price || 0,
            originalPrice: p.compare_price || prev?.originalPrice,
            label: p.category ? `${p.category} Premium` : prev?.label,
            category: p.category?.toLowerCase() || prev?.category,
            type: p.subcategory?.toLowerCase() || prev?.type,
            sizes: p.sizes || prev?.sizes || [],
            size_stock: p.size_stock || prev?.size_stock || {},
            stock_quantity: p.stock_quantity ?? prev?.stock_quantity,
            discount: p.discount ?? (p.compare_price && p.compare_price > p.price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : prev?.discount),
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
    
    hydrateProduct();
  }, [params.id, location.state]);

  // ─── AGGRESSIVE IMAGE DEDUPLICATION ───
  const images = useMemo(() => {
    if (!product) return [];
    const imgs: string[] = [];
    
    if (product.frontImg) imgs.push(product.frontImg);
    if (product.backImg) imgs.push(product.backImg);
    
    if (product.images && Array.isArray(product.images)) {
      imgs.push(...product.images);
    } else if (typeof product.images === 'string') {
      try { 
        imgs.push(...JSON.parse(product.images)); 
      } catch (e) {}
    }
    
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
    setSelectedSize('');
  }, [params.id]);

  useEffect(() => {
    if (!product) return;
    const fetchRelated = async () => {
      try {
        const { data } = await productsApi.list({ status: 'active', limit: 100 });
        const related = (Array.isArray(data) ? data : [])
          .filter(
            (p: any) =>
              p &&
              String(p.id || p.$id) !== String(product.id) &&
              (p.category?.toLowerCase() === product.category ||
                p.subcategory?.toLowerCase() === product.type)
          )
          .slice(0, 4)
          .map((p: any) => {
            let pImages: string[] = [];
            if (Array.isArray(p.images)) {
              pImages = p.images;
            } else if (typeof p.images === 'string') {
              try {
                pImages = JSON.parse(p.images);
              } catch {
                pImages = p.images.split(',').map((s: string) => s.trim());
              }
            }

            return {
              id: p.id || p.$id || '',
              name: p.name || '',
              price: p.price || 0,
              originalPrice: p.compare_price,
              label: `${p.category || 'Collection'} Premium`,
              category: p.category?.toLowerCase(),
              type: p.subcategory?.toLowerCase(),
              sizes: Array.isArray(p.sizes) ? p.sizes : [],
              discount: p.discount ?? (p.compare_price && p.compare_price > p.price ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100) : undefined),
              frontImg: pImages[0] || '',
              backImg: pImages[1] || pImages[0] || '',
              images: pImages,
              description: p.description || ''
            };
          });
        setRelatedProducts(related);
      } catch (err) {
        console.error("Failed to fetch related products", err);
      }
    };
    fetchRelated();
  }, [product]);

  const switchImage = (index: number) => {
    if (index === activeImg) return;
    setImgLoaded(false);
    setActiveImg(index);
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;
    const nextIdx = (activeImg + 1) % images.length;
    switchImage(nextIdx);
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    const prevIdx = (activeImg - 1 + images.length) % images.length;
    switchImage(prevIdx);
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
        size: requireSizeSelection ? selectedSize : undefined,
      });
      setNotifyStatus('done');
    } catch (err: any) {
      setNotifyStatus('error');
      setNotifyError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  useEffect(() => {
    setNotifyStatus('idle');
    setNotifyError('');
  }, [selectedSize]);

  const handleAddToCart = () => {
    if (!product || (requireSizeSelection && !selectedSize)) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: requireSizeSelection ? selectedSize : 'One Size',
      quantity,
      image: images[0] || product.frontImg || '',
      category: product.category || 'unknown',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product || (requireSizeSelection && !selectedSize)) return;
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
      <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--theme-accent)]">Loading product...</p>
        </div>
      </div>
    );
  }

  const sizeStock = product.size_stock || {};
  const isNoSizeProduct = !requireSizeSelection;
  const isSizeOutOfStock = (size: string) => (sizeStock[size] ?? 0) <= 0;
  
  const overallInStock = isNoSizeProduct
    ? (product.stock_quantity ?? 0) > 0
    : availableSizes.some(s => !isSizeOutOfStock(s));
    
  const showNotifyMe = isNoSizeProduct
    ? !overallInStock
    : !!selectedSize && isSizeOutOfStock(selectedSize);

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] font-sans selection:bg-[rgba(var(--theme-accent-rgb),0.3)] selection:text-[var(--theme-text)]">
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
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors duration-300 mb-12 group"
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
                className="relative w-full aspect-[4/5] bg-[#0d0d0d] overflow-hidden group"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Discount badge */}
                {product.discount && (
                  <div className="absolute top-5 right-5 z-10 px-3 py-1.5 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[9px] uppercase tracking-[0.2em] font-bold font-plex-mono">
                    {product.discount}% OFF
                  </div>
                )}

                {/* Main image with fade */}
                {images.length > 0 && images[activeImg] && (
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
                )}

                {/* Navigation Arrows */}
                {images.length > 1 && (
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
                  <div className="absolute bottom-5 right-5 text-[9px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] tracking-[0.2em]">
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
                          ? 'ring-1 ring-[var(--theme-accent)] opacity-100'
                          : 'opacity-50 hover:opacity-80 ring-1 ring-transparent hover:ring-[rgba(var(--theme-text-rgb),0.2)]'
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
                  <p className="text-[10px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)]" style={{ margin: 0 }}>
                    {product.label || "Men's Collection"}
                  </p>
                  {!isNonApparel && <TryOn onClick={() => setTryOnOpen(true)} />}
                </div>

                <h1
                  className="font-archivo font-extrabold uppercase text-[var(--theme-text)] leading-[0.9] tracking-[-0.01em]"
                  style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', fontStretch: '125%' }}
                >
                  {product.name}
                </h1>

                {/* Price and Share row */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-baseline gap-4">
                    <span className="text-2xl font-plex-mono text-[var(--theme-text)]">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className="text-sm font-plex-mono text-[rgba(var(--theme-text-rgb),0.3)] line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
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
                    className="flex items-center justify-center w-10 h-10 rounded-full border border-[rgba(var(--theme-text-rgb),0.2)] text-[var(--theme-text)] hover:bg-[var(--theme-text)] hover:text-[var(--theme-bg)] transition-colors"
                    title="Share this product"
                    aria-label="Share product"
                  >
                    <span className="text-xl leading-none">↗</span>
                  </button>
                </div>
              </motion.div>

              {/* Divider */}
              <div className="h-px bg-[rgba(var(--theme-text-rgb),0.08)]" />

              {/* Size selector — Dynamic based on DB entry */}
              {requireSizeSelection && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)]">
                      Size
                    </span>
                    <button 
                      className="text-[10px] uppercase tracking-[0.15em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[var(--theme-accent)] transition-colors duration-300 underline underline-offset-4" 
                      onClick={() => navigate('/size-guide')}
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableSizes.map((size) => {
                      const outOfStock = isSizeOutOfStock(size);
                      return (
                        <button
                          key={size}
                          id={`size-${size.replace(/\s+/g, '-')}`}
                          onClick={() => {
                            setSelectedSize(size);
                            setSizeError(false);
                          }}
                          className={`relative min-w-[3.2rem] px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-plex-mono transition-all duration-200 border ${
                            selectedSize === size
                              ? 'border-[var(--theme-accent)] text-[var(--theme-bg)] bg-[var(--theme-accent)]'
                              : outOfStock
                              ? 'border-[rgba(var(--theme-text-rgb),0.12)] text-[rgba(var(--theme-text-rgb),0.3)] hover:border-[rgba(var(--theme-text-rgb),0.3)]'
                              : 'border-[rgba(var(--theme-text-rgb),0.12)] text-[rgba(var(--theme-text-rgb),0.5)] hover:border-[rgba(var(--theme-text-rgb),0.35)] hover:text-[var(--theme-text)]/80'
                          }`}
                        >
                          <span className={outOfStock ? 'line-through decoration-[rgba(var(--theme-text-rgb),0.3)]' : ''}>{size}</span>
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
                        className="text-[10px] tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-accent-rgb),0.7)]"
                      >
                        Please select a size to continue
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* Quantity + Total */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)]">
                    Quantity
                  </span>
                  <div className="flex items-center border border-[rgba(var(--theme-text-rgb),0.12)] h-10">
                    <button
                      id="qty-minus"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-10 h-full flex items-center justify-center text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-200"
                    >
                      <Minus size={12} strokeWidth={1.5} />
                    </button>
                    <span className="w-10 text-center font-plex-mono text-[13px] text-[var(--theme-text)] select-none">
                      {quantity}
                    </span>
                    <button
                      id="qty-plus"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-10 h-full flex items-center justify-center text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-200"
                    >
                      <Plus size={12} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Total line */}
                <div className="flex items-center justify-between py-3 border-t border-b border-[rgba(var(--theme-text-rgb),0.08)]">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)]">
                    Total
                  </span>
                  <span className="font-plex-mono text-lg text-[var(--theme-text)]">
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
                  <div className="border border-[rgba(var(--theme-text-rgb),0.12)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.6)] mb-1">
                      {isNoSizeProduct ? 'Currently Out of Stock' : `Size ${selectedSize} is Out of Stock`}
                    </p>
                    <p className="text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.4)] mb-4">
                      Enter your email and we'll let you know the moment it's back.
                    </p>
                    {notifyStatus === 'done' ? (
                      <p className="text-[11px] font-plex-mono text-[var(--theme-accent)] flex items-center gap-2">
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
                              className="flex-1 bg-transparent border border-[rgba(var(--theme-text-rgb),0.15)] px-4 py-3 text-[11px] font-plex-mono text-[var(--theme-text)] placeholder:text-[rgba(var(--theme-text-rgb),0.25)] focus:border-[rgba(var(--theme-accent-rgb),0.5)] focus:outline-none"
                            />
                          )}
                          <button
                            onClick={handleNotifyMe}
                            disabled={notifyStatus === 'submitting'}
                            className="px-6 py-3 bg-[var(--theme-accent)] text-[var(--theme-bg)] text-[10px] uppercase tracking-[0.2em] font-plex-mono font-bold hover:brightness-110 transition-colors disabled:opacity-50 whitespace-nowrap"
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
                      disabled={requireSizeSelection && !selectedSize}
                      className={`relative w-full h-[54px] flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.25em] font-plex-mono font-bold overflow-hidden transition-all duration-300 ${
                        (!requireSizeSelection || selectedSize)
                          ? 'bg-[var(--theme-text)] text-[var(--theme-bg)] hover:bg-[var(--theme-accent)] cursor-pointer'
                          : 'bg-[rgba(var(--theme-text-rgb),0.08)] text-[rgba(var(--theme-text-rgb),0.25)] cursor-not-allowed'
                      }`}
                    >
                      <AnimatePresence mode="wait">
                        {added ? (
                          <motion.span
                            key="added"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                          >
                            Added to Bag
                          </motion.span>
                        ) : (
                          <motion.span
                            key="normal"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-2"
                          >
                            <ShoppingBag size={14} strokeWidth={1.5} />
                            Add to Bag
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    {/* Buy Now */}
                    <button
                      id="buy-now"
                      onClick={handleBuyNow}
                      disabled={requireSizeSelection && !selectedSize}
                      className={`w-full h-[54px] flex items-center justify-center gap-3 text-[11px] uppercase tracking-[0.25em] font-plex-mono font-bold border transition-all duration-300 ${
                        (!requireSizeSelection || selectedSize)
                          ? 'border-[var(--theme-text)] text-[var(--theme-text)] hover:border-[var(--theme-accent)] hover:text-[var(--theme-accent)] cursor-pointer'
                          : 'border-[rgba(var(--theme-text-rgb),0.12)] text-[rgba(var(--theme-text-rgb),0.25)] cursor-not-allowed'
                      }`}
                    >
                      Buy Now
                      <ArrowRight size={14} strokeWidth={1.5} />
                    </button>
                  </>
                )}
              </motion.div>

              {/* ── PRODUCT DETAILS (parsed rich-text description) ── */}
              {parsedDescriptionSections && (
                <div className="mt-2">
                  {parsedDescriptionSections.map((section, i) => (
                    <AccordionSection key={section.title + i} title={section.title} defaultOpen={i === 0}>
                      <div
                        className="text-[13px] leading-relaxed text-[rgba(var(--theme-text-rgb),0.6)] font-sans [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                        dangerouslySetInnerHTML={{ __html: section.content }}
                      />
                    </AccordionSection>
                  ))}
                </div>
              )}

            </div>

          </div>

          {/* ── REVIEWS ── */}
          {product && (
            <div className="mt-20 pt-16 border-t border-[rgba(var(--theme-text-rgb),0.08)]">
              <ReviewSection productId={product.id} />
            </div>
          )}

          {/* ── RELATED PRODUCTS ── */}
          {relatedProducts.length > 0 && (
            <div className="mt-24 pt-16 border-t border-[rgba(var(--theme-text-rgb),0.08)]">
              <h2 className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-8 text-center md:text-left">
                You May Also Like
              </h2>
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
          )}

        </div>
      </main>

      {/* ── VIRTUAL TRY-ON MODAL ── */}
      {product && (
        <TryOnModal
          isOpen={tryOnOpen}
          onClose={() => setTryOnOpen(false)}
          productId={product.id}
          clothImages={images}
        />
      )}
    </div>
  );
}