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

type ProductDetail = {
  id: string;
  name: string;
  price: number;
  label?: string;
  category?: string;
  type?: string;
  sizes?: string[];
  frontImg: string;
  backImg?: string;
  description?: string;
  originalPrice?: number;
  discount?: string;
  images?: string[];
};

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

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

function buildDescription(product: ProductDetail) {
  if (product.description) return product.description;
  if (product.category === 'jewellery')
    return 'A statement piece designed with a clean, elevated finish that carries through the collection with precision.';
  if (product.type === 'lower')
    return 'Tailored for movement with a clean silhouette and a relaxed, modern drape.';
  return 'A refined oversized cut in heavyweight cotton — designed for the archive, built for the everyday. One of a kind, never restocked.';
}

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
  const { token } = useAuth();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(true);
  const [added, setAdded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductDetail[]>([]);
  const [tryOnOpen, setTryOnOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const product = (location.state as { product?: ProductDetail } | null)?.product;

  const images = useMemo(() => {
    if (!product) return [];
    const imgs = [product.frontImg];
    if (product.backImg && product.backImg !== product.frontImg) imgs.push(product.backImg);
    if (product.images) {
      product.images.forEach((img) => {
        if (!imgs.includes(img)) imgs.push(img);
      });
    }
    return imgs;
  }, [product]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setSelectedSize('');
    setQuantity(1);
    setActiveImg(0);
    setAdded(false);
  }, [product?.id]);

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
            frontImg: p.images?.[0] || '',
            backImg: p.images?.[1] || p.images?.[0] || '',
          }));
        setRelatedProducts(related);
      } catch {}
    };
    fetchRelated();
  }, [product?.id]);

  const switchImage = (index: number) => {
    if (index === activeImg) return;
    setImgLoaded(false);
    setTimeout(() => {
      setActiveImg(index);
      setImgLoaded(true);
    }, 250);
  };

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
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C8A96A]">Product not found</p>
          <h1 className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] uppercase">
            {params.id}
          </h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 border border-[#EAE6E1]/20 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#EAE6E1]/70 hover:text-[#EAE6E1] hover:border-[#C8A96A]/40 transition-colors duration-300"
          >
            <ChevronLeft size={14} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const productDescription = buildDescription(product);
  const sizes = product.sizes?.length ? product.sizes : DEFAULT_SIZES;

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
                  <div className="absolute top-5 left-5 z-10 px-3 py-1.5 bg-[#C8A96A] text-[#12100C] text-[9px] uppercase tracking-[0.2em] font-bold font-plex-mono">
                    {product.discount}
                  </div>
                )}

                {/* Main image with fade */}
                <img
                  key={activeImg}
                  src={images[activeImg]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  onLoad={() => setImgLoaded(true)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 300ms ease',
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

                {/* Description */}
                <p className="text-[13px] font-plex-mono leading-[1.8] text-[#EAE6E1]/55 tracking-[0.01em]">
                  {productDescription}
                </p>
              </motion.div>

              {/* Divider */}
              <div className="h-px bg-[#EAE6E1]/8" />

              {/* Size selector */}
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
                  <button className="text-[10px] uppercase tracking-[0.15em] font-plex-mono text-[#EAE6E1]/30 hover:text-[#C8A96A] transition-colors duration-300 underline underline-offset-4">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      id={`size-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.2rem] px-4 py-3 text-[10px] uppercase tracking-[0.2em] font-plex-mono transition-all duration-200 border ${
                        selectedSize === size
                          ? 'border-[#C8A96A] text-[#C8A96A] bg-[#C8A96A]/8'
                          : 'border-[#EAE6E1]/12 text-[#EAE6E1]/50 hover:border-[#EAE6E1]/35 hover:text-[#EAE6E1]/80'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {!selectedSize && (
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
              </motion.div>

              {/* Product details accordion */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="pt-2"
              >
                <AccordionSection title="Materials &amp; Construction" defaultOpen={true}>
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

                <AccordionSection title="Fit &amp; Sizing">
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

                <AccordionSection title="Delivery &amp; Returns">
                  <div className="space-y-3 text-[12px] font-plex-mono text-[#EAE6E1]/60 leading-relaxed">
                    <p>Free shipping on orders above ₹999.</p>
                    <p>Dispatched within 2–4 business days. Delivery in 5–8 days.</p>
                    <p>14-day returns accepted on unworn, unaltered items with original tags intact.</p>
                  </div>
                </AccordionSection>
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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-12">
                {relatedProducts.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.7, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                    className="group cursor-pointer"
                    onClick={() =>
                      navigate(`/product/${p.id}`, { state: { product: p } })
                    }
                  >
                    <div className="relative aspect-[3/4] bg-[#0d0d0d] overflow-hidden mb-5">
                      <img
                        src={p.frontImg}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-105 opacity-85 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-400" />
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.25em] font-plex-mono text-[#C8A96A] mb-1.5">
                      {p.label}
                    </p>
                    <h3 className="text-[13px] font-archivo font-bold tracking-[0.05em] text-[#EAE6E1] uppercase mb-2 leading-tight line-clamp-2">
                      {p.name}
                    </h3>
                    <p className="text-[12px] font-plex-mono text-[#EAE6E1]/60">
                      {formatPrice(p.price)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer spacer */}
        <div className="h-32" />
      </main>

      {/* Try On Modal */}
      <TryOnModal isOpen={tryOnOpen} onClose={() => setTryOnOpen(false)} />
    </div>
  );
}
