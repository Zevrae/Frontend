import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import PinterestCard from './components/PinterestCard';
import './components/PinterestCard.css';
import stuffedAnimalImg from './assets/stuffed animal.jpg';
import { productsApi } from './api/products';
import ringImg from "./assets/static/RING.webp";
import keychainImg from "./assets/static/KEYCHAIN.webp";
import earringsImg from "./assets/static/EARRINGS.webp";
import pendantImg from "./assets/static/PENDANT.webp";
import braceletImg from "./assets/static/BRACELET.webp";
import menTshirts from "./assets/static/menTshirts.webp";
import womenTops from "./assets/static/womenTops.webp";
import menRingImg from "./assets/men ring.png";
import menPendantImg from "./assets/men pendant.png";
import menEarringsImg from "./assets/men earrings.png";

const mensCategories = [
  { id: 'tshirts', name: 'TSHIRTS', image: menTshirts, path: '/men/tshirts' },
  { id: 'lowers',  name: 'LOWERS',  image: 'https://i.ibb.co/RGyBrL7q/THE-DRAGON-LOWER-FRONT.jpg', path: '/men/lowers' }
];

const womensCategories = [
  { id: 'tshirts', name: 'TSHIRTS', image: womenTops, path: '/women/tshirts' },
  { id: 'lowers',  name: 'LOWERS',  image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1920&auto=format&fit=crop', path: '/women/lowers' }
];


// Subcategory cards for Men's Jewellery
const mensJewelleryCategories = [
  { id: 'rings',     name: 'RINGS',     image: menRingImg,     fit: 'contain', path: '/jewellery/men/rings' },
  { id: 'pendants',  name: 'PENDANTS',  image: menPendantImg,  fit: 'contain', path: '/jewellery/men/pendants' },
  { id: 'bracelets', name: 'BRACELETS', image: braceletImg, fit: 'contain', path: '/jewellery/men/bracelets' },
  { id: 'earrings',  name: 'EARRINGS',  image: menEarringsImg, fit: 'contain', path: '/jewellery/men/earrings' },
];

// Subcategory cards for Women's Jewellery
const womensJewelleryCategories = [
  { id: 'rings',     name: 'RINGS',     image: ringImg,     fit: 'contain', path: '/jewellery/women/rings' },
  { id: 'pendants',  name: 'PENDANTS',  image: pendantImg,  fit: 'contain', path: '/jewellery/women/pendants' },
  { id: 'bracelets', name: 'BRACELETS', image: braceletImg, fit: 'contain', path: '/jewellery/women/bracelets' },
  { id: 'earrings',  name: 'EARRINGS',  image: earringsImg, fit: 'contain', path: '/jewellery/women/earrings' },
];

const accessoriesCategories = [
  { id: 'keychain', name: 'KEYCHAIN', image: keychainImg,     fit: 'contain', path: '/accessories/keychain' },
  { id: 'toys',     name: 'TOYS',     image: stuffedAnimalImg, fit: 'cover',   path: '/accessories/toys' }
];

export default function ProductGrid({ 
  categoryFilter = 'all' 
}: { 
  categoryFilter?: 
    | 'all' | 'men' | 'women' | 'jewellery' | 'accessories' | ''
    | 'rings' | 'pendants' | 'earrings' | 'bracelet' | 'keychain' | 'keychains'
    | 'toys' | 'soft-toys' | 'ear'
    | 'men-tshirts' | 'men-lowers' | 'women-tshirts' | 'women-lowers' | 'unisex'
    | 'jewellery-men' | 'jewellery-women'
    | 'men-rings' | 'men-pendants' | 'men-bracelets' | 'men-earrings'
    | 'women-rings' | 'women-pendants' | 'women-bracelets' | 'women-earrings'
}) {
  const navigate = useNavigate();
  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const { data } = await productsApi.list({ status: 'active', limit: 100 });

        const formatted = (data || []).map((p: any) => {
          const catLower = p.category?.toLowerCase() || '';
          const isJewellery   = catLower === 'jewellery' || catLower.startsWith('jewellery/');
          const isAccessories = catLower === 'accessories';
          const isMenJewellery   = catLower === 'jewellery/men';
          const isWomenJewellery = catLower === 'jewellery/women';

          // gender is used for top-level filtering
          let gender: string;
          if (isMenJewellery)   gender = 'jewellery-men';
          else if (isWomenJewellery) gender = 'jewellery-women';
          else gender = catLower;

          return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.compare_price,
            label: `${p.category} Premium`,
            // For jewellery & accessories use subcategory as the filter key;
            // for apparel use the top-level category (men/women/unisex)
            category: (isJewellery || isAccessories)
              ? p.subcategory?.toLowerCase()
              : catLower || '',
            gender,
            type: p.subcategory?.toLowerCase() === 'lowers'
              ? 'lower'
              : (p.subcategory?.toLowerCase()?.includes('shirt') ? 'tshirt' : (p.subcategory?.toLowerCase() || 'tshirt')),
            sizes: p.sizes,
            discount: p.discount || (p.compare_price && p.compare_price > p.price
              ? Math.round(((p.compare_price - p.price) / p.compare_price) * 100)
              : undefined),
            description: p.description,
            frontImg: p.images?.[0] || '',
            backImg:  p.images?.[1] || p.images?.[0] || '',
          };
        });
        setDbProducts(formatted);
      } catch (err) {
        console.error('Failed to fetch DB products', err);
      }
    };
    fetchDbProducts();
  }, [categoryFilter]);

  // ─── Product pools ───────────────────────────────────────────────────────────
  const dbMenProducts          = dbProducts.filter(p => p.gender === 'men'   || p.gender === 'unisex');
  const dbWomenProducts        = dbProducts.filter(p => p.gender === 'women' || p.gender === 'unisex');
  const dbJewelleryMenProducts   = dbProducts.filter(p => p.gender === 'jewellery-men');
  const dbJewelleryWomenProducts = dbProducts.filter(p => p.gender === 'jewellery-women');
  const dbAccessoriesProducts  = dbProducts.filter(p => p.gender === 'accessories');

  const allWomenProducts = dbWomenProducts;

  // ─── Apparel subcategory helpers ─────────────────────────────────────────────
  const isMenFilter    = categoryFilter.startsWith('men') && !categoryFilter.startsWith('men-rings') && !categoryFilter.startsWith('men-pendants') && !categoryFilter.startsWith('men-bracelets') && !categoryFilter.startsWith('men-earrings');
  const isTshirtFilter = categoryFilter.includes('tshirts');

  const activeSubcategoryProducts = dbProducts.filter(p =>
    (p.gender === (isMenFilter ? 'men' : 'women') || p.gender === 'unisex') &&
    p.type === (isTshirtFilter ? 'tshirt' : 'lower')
  );

  // ─── Gendered jewellery helpers ───────────────────────────────────────────────
  const JEWELLERY_MEN_SUBS   = ['men-rings', 'men-pendants', 'men-bracelets', 'men-earrings'];
  const JEWELLERY_WOMEN_SUBS = ['women-rings', 'women-pendants', 'women-bracelets', 'women-earrings'];
  const isGenderedJewellerySubcategory = [...JEWELLERY_MEN_SUBS, ...JEWELLERY_WOMEN_SUBS].includes(categoryFilter);

  const getJewellerySubcategoryLabel = () => {
    const parts = categoryFilter.split('-');
    if (parts.length < 2) return '';
    return parts.slice(1).join(' ').toUpperCase();
  };

  const getGenderedJewelleryProducts = () => {
    const isMenSub = categoryFilter.startsWith('men-');
    const [, ...subParts] = categoryFilter.split('-');
    const sub = subParts.join('').toLowerCase(); // "rings", "pendants", "bracelets", "earrings"
    const pool = isMenSub ? dbJewelleryMenProducts : dbJewelleryWomenProducts;
    if (!sub) return pool;
    return pool.filter(p => p.category?.toLowerCase() === sub);
  };

  const openProduct = (product: any) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  // ─── Reusable Jewellery Subcategory Grid ─────────────────────────────────────
  const JewellerySubcategoryGrid = ({ categories }: { categories: typeof mensJewelleryCategories }) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
      {categories.map((item, i) => (
        <motion.div 
          key={item.id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: (i % 4) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="group relative flex flex-col cursor-pointer"
          onClick={() => navigate(item.path)}
        >
          <div className="relative aspect-[3/4] mb-6 bg-[var(--theme-surface)] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-accent-rgb),0.25)]" data-cursor-image>
            <img 
              src={item.image} 
              alt={item.name} 
              className={`absolute inset-0 w-full h-full ${item.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100`}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
            <div className="absolute inset-0 flex items-center justify-center">
              <h3 className="text-2xl font-archivo font-bold tracking-[0.2em] text-[var(--theme-text)] uppercase text-center w-full px-2">
                {item.name}
              </h3>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // ─── Shared section heading ───────────────────────────────────────────────────
  const SectionHeading = ({ eyebrow, title }: { eyebrow: string; title: string }) => (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-4 flex items-center justify-center md:justify-start"
      >
        <button onClick={() => navigate(-1)} className="flex items-center hover:text-white transition-colors duration-300 outline-none">
          <ChevronLeft className="w-4 h-4 mr-2" />
          {eyebrow}
        </button>
      </motion.h2>
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[var(--theme-text)] text-center md:text-left uppercase"
      >
        {title}
      </motion.h3>
    </div>
  );

  return (
    <>
      <AnimatePresence mode="wait">

      {/* ── MEN'S SECTION ── */}
      {categoryFilter === 'men' && (
        <motion.section 
          key="men"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="men" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10"
        >
          <SectionHeading eyebrow="LATEST DROPS" title="Men's Collection" />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-[36px] items-center">
              {mensCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full md:w-[460px] max-w-[460px] group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[var(--theme-surface)] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-accent-rgb),0.25)]" data-cursor-image>
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-archivo font-bold tracking-[0.2em] text-[var(--theme-text)] uppercase">{item.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {dbMenProducts.length > 0 && (
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }} className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-8 text-center md:text-left">FROM OUR CATALOG</motion.h2>
              <div className="pinterest-grid">
                {dbMenProducts.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ── GENDERED SUBCATEGORIES (MEN/WOMEN TSHIRTS & LOWERS) ── */}
      {['men-tshirts', 'men-lowers', 'women-tshirts', 'women-lowers'].includes(categoryFilter) && (
        <motion.section 
          key="gendered-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="gendered-category" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading
            eyebrow={isMenFilter ? "MEN'S COLLECTION" : "WOMEN'S COLLECTION"}
            title={`${isMenFilter ? "MEN'S" : "WOMEN'S"} ${isTshirtFilter ? 'TSHIRTS' : 'LOWERS'}`}
          />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            {activeSubcategoryProducts.length === 0 ? (
              <div className="w-full flex justify-center py-24">
                <h3 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.5)] uppercase">New Collection Coming Soon</h3>
              </div>
            ) : (
              <div className="pinterest-grid">
                {activeSubcategoryProducts.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
              </div>
            )}
          </div>
        </motion.section>
      )}

      {/* ── WOMEN'S SECTION ── */}
      {categoryFilter === 'women' && (
        <motion.section 
          key="women"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="women" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading eyebrow="NEW ARRIVALS" title="Women's Collection" />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-[36px] items-center">
              {womensCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full md:w-[460px] max-w-[460px] group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[var(--theme-surface)] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-accent-rgb),0.25)]" data-cursor-image>
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-archivo font-bold tracking-[0.2em] text-[var(--theme-text)] uppercase">{item.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {allWomenProducts.length > 0 && (
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }} className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-8 text-center md:text-left">FROM OUR CATALOG</motion.h2>
              <div className="pinterest-grid">
                {allWomenProducts.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ── ACCESSORIES ── */}
      {categoryFilter === 'accessories' && (
        <motion.section 
          key="accessories"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="accessories" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading eyebrow="NEW ARRIVALS" title="ACCESSORIES COLLECTION" />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 max-w-2xl mx-auto">
              {accessoriesCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 6) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="relative aspect-[3/4] mb-6 bg-[var(--theme-surface)] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(var(--theme-accent-rgb),0.25)]" data-cursor-image>
                    <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className={`text-3xl font-archivo font-bold tracking-[0.2em] uppercase text-center w-full px-2 ${item.id === 'toys' ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-text)]'}`}>{item.name}</h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}


      {/* ── JEWELLERY / MEN LANDING ── */}
      {categoryFilter === 'jewellery-men' && (
        <motion.section 
          key="jewellery-men"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery-men" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading eyebrow="JEWELLERY" title="MEN'S JEWELLERY" />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <JewellerySubcategoryGrid categories={mensJewelleryCategories} />
          </div>
          {dbJewelleryMenProducts.length > 0 && (
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }} className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-8 text-center md:text-left">FROM OUR CATALOG</motion.h2>
              <div className="pinterest-grid">
                {dbJewelleryMenProducts.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ── JEWELLERY / WOMEN LANDING ── */}
      {categoryFilter === 'jewellery-women' && (
        <motion.section 
          key="jewellery-women"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery-women" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading eyebrow="JEWELLERY" title="WOMEN'S JEWELLERY" />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <JewellerySubcategoryGrid categories={womensJewelleryCategories} />
          </div>
          {dbJewelleryWomenProducts.length > 0 && (
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }} className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-8 text-center md:text-left">FROM OUR CATALOG</motion.h2>
              <div className="pinterest-grid">
                {dbJewelleryWomenProducts.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* ── GENDERED JEWELLERY SUBCATEGORIES (men-rings, women-pendants, etc.) ── */}
      {isGenderedJewellerySubcategory && (
        <motion.section 
          key="gendered-jewellery-sub"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="gendered-jewellery-sub" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading
            eyebrow={categoryFilter.startsWith('men-') ? "MEN'S JEWELLERY" : "WOMEN'S JEWELLERY"}
            title={getJewellerySubcategoryLabel()}
          />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            {(() => {
              const filtered = getGenderedJewelleryProducts();
              return filtered.length === 0 ? (
                <div className="w-full flex justify-center py-24">
                  <h3 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.5)] uppercase">New Collection Coming Soon</h3>
                </div>
              ) : (
                <div className="pinterest-grid">
                  {filtered.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
                </div>
              );
            })()}
          </div>
        </motion.section>
      )}

      {/* ── ACCESSORIES SUBCATEGORIES ── */}
      {['keychain', 'keychains', 'toys', 'soft-toys'].includes(categoryFilter) && (
        <motion.section 
          key="accessories-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="accessories-category" 
          className="py-[120px] bg-[var(--theme-bg)] relative z-10 border-t border-[rgba(var(--theme-accent-rgb),0.1)]"
        >
          <SectionHeading
            eyebrow="ACCESSORIES"
            title={(categoryFilter === 'keychain' || categoryFilter === 'keychains') ? 'KEYCHAINS' : 'SOFT TOYS'}
          />
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            {(() => {
              const normalizedFilter = (categoryFilter === 'keychain' || categoryFilter === 'keychains') ? 'keychains' : 'soft toys';
              const filtered = dbAccessoriesProducts.filter(p => p.category === normalizedFilter);
              return filtered.length === 0 ? (
                <div className="w-full flex justify-center py-24">
                  <h3 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.5)] uppercase">New Collection Coming Soon</h3>
                </div>
              ) : (
                <div className="pinterest-grid">
                  {filtered.map((item, i) => <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />)}
                </div>
              );
            })()}
          </div>
        </motion.section>
      )}

      </AnimatePresence>
    </>
  );
}