import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { supabase } from './supabaseClient';

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
};

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function buildDescription(product: ProductDetail) {
  if (product.description) return product.description;

  if (product.category === 'jewellery') {
    return 'A statement piece designed with a clean, elevated finish that carries through the collection with precision.';
  }

  if (product.type === 'lower') {
    return 'Tailored for movement with a clean silhouette and a relaxed, modern drape.';
  }

  return 'A refined staple cut for everyday wear with a sharp profile and a premium finish.';
}

export default function ProductPage() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const { addToCart } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const product = (location.state as { product?: ProductDetail } | null)?.product;

  const images = useMemo(() => {
    if (!product) return [];
    return [product.frontImg, product.backImg || product.frontImg];
  }, [product]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedSize('');
    setQuantity(1);
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.frontImg,
      category: product.category || 'unknown'
    });
  };

  const handleBuyNow = async () => {
    if (!product || !selectedSize) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setIsLoginModalOpen(true);
      return;
    }

    handleAddToCart();
    navigate('/checkout');
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-[#EAE6E1] flex items-center justify-center px-6">
        <div className="max-w-lg text-center space-y-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#C5A059]">Product not found</p>
          <h1 className="text-3xl md:text-5xl font-serif tracking-[0.1em] uppercase">{params.id}</h1>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 border border-[#EAE6E1]/20 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#EAE6E1]/70 hover:text-[#EAE6E1] hover:border-[#C5A059]/40 transition-colors"
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
    <div className="min-h-screen bg-[#0a0a0a] text-[#EAE6E1] font-sans selection:bg-[#C5A059]/30 selection:text-[#EAE6E1]">
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0 mix-blend-difference"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      <main className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-12 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-16">
          <section className="space-y-8 lg:space-y-[18vh]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="min-h-[78vh] bg-[#0f0f0f] border border-[#EAE6E1]/5 overflow-hidden"
            >
              <img
                src={images[0]}
                alt={`${product.name} front`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="min-h-[78vh] bg-[#0f0f0f] border border-[#EAE6E1]/5 overflow-hidden"
            >
              <img
                src={images[1]}
                alt={`${product.name} back`}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </section>

          <section className="flex flex-col gap-10">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div className="space-y-4 max-w-xl">
                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-[#C5A059] hover:text-[#EAE6E1] transition-colors"
                >
                  <ChevronLeft size={12} />
                  {product.label || 'Back'}
                </button>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-light tracking-[0.08em] uppercase leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-xl md:text-2xl font-mono text-[#EAE6E1]">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}
                  </p>
                  {product.originalPrice ? (
                    <p className="text-sm font-mono text-[#EAE6E1]/35 line-through">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.originalPrice)}
                    </p>
                  ) : null}
                </div>
              </div>

              <p className="max-w-xl text-[13px] md:text-[14px] font-serif leading-relaxed text-[#EAE6E1]/65 tracking-[0.02em]">
                {productDescription}
              </p>

              <div className="max-w-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/50">Size</span>
                  <button className="text-[10px] uppercase tracking-[0.1em] text-[#EAE6E1]/40 hover:text-[#EAE6E1] underline underline-offset-4">
                    Size Guide
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[3.25rem] border px-4 py-3 text-[11px] uppercase tracking-[0.15em] transition-colors ${
                        selectedSize === size
                          ? 'border-[#C5A059] text-[#C5A059] bg-[#C5A059]/10'
                          : 'border-[#EAE6E1]/15 text-[#EAE6E1]/60 hover:border-[#EAE6E1]/40'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p className="mt-3 text-[10px] tracking-[0.2em] text-[#C5A059]">Please select a size</p>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="mt-[4vh] lg:mt-[18vh] max-w-xl"
            >
              <div className="border-t border-[#EAE6E1]/10 pt-8 space-y-4">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/45">
                  <span>Quantity</span>
                  <div className="flex items-center border border-[#EAE6E1]/15">
                    <button
                      onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                      className="px-4 py-3 text-[#EAE6E1]/70 hover:text-[#C5A059] transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-12 text-center font-mono text-[13px]">{quantity}</span>
                    <button
                      onClick={() => setQuantity((current) => current + 1)}
                      className="px-4 py-3 text-[#EAE6E1]/70 hover:text-[#C5A059] transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 text-[11px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/55">
                  <span>Total</span>
                  <span className="text-lg font-mono text-[#EAE6E1]">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price * quantity)}
                  </span>
                </div>

                <div className="space-y-4 pt-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={!selectedSize}
                    className={`w-full py-4 flex items-center justify-center gap-3 uppercase tracking-[0.2em] font-bold text-[11px] transition-colors ${
                      selectedSize
                        ? 'bg-[#EAE6E1] text-[#0a0a0a] hover:bg-[#C5A059]'
                        : 'bg-[#EAE6E1]/10 text-[#EAE6E1]/30 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingCart size={16} strokeWidth={2} />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={!selectedSize}
                    className={`w-full py-4 uppercase tracking-[0.2em] font-bold text-[11px] transition-colors border ${
                      selectedSize
                        ? 'border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059] hover:text-[#0a0a0a]'
                        : 'border-[#EAE6E1]/10 text-[#EAE6E1]/30 cursor-not-allowed'
                    }`}
                  >
                    Buy It Now
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
}
