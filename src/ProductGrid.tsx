import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ProductCardSober from './components/ProductCardSober';
import PinterestCard from './components/PinterestCard';
import './components/PinterestCard.css';
import ComingSoon from './pages/comingsoon/ComingSoon';
import stuffedAnimalImg from './assets/stuffed animal.jpg';
import { productsApi } from './api/products';
const mensCategories = [
  {
    id: 'tshirts',
    name: 'TSHIRTS',
    image: 'https://i.ibb.co/PZvccJ85/THE-WHITE-MONSTER-FRONT.png',
    path: '/men/tshirts'
  },
  {
    id: 'lowers',
    name: 'LOWERS',
    image: 'https://i.ibb.co/RGyBrL7q/THE-DRAGON-LOWER-FRONT.jpg',
    path: '/men/lowers'
  }
];
const womensCategories = [
  {
    id: 'tshirts',
    name: 'TSHIRTS',
    image: 'https://i.ibb.co/21qqDjDv/LIGHTNING-MCQUEEN-BLACK.png',
    path: '/women/tshirts'
  },
  {
    id: 'lowers',
    name: 'LOWERS',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1920&auto=format&fit=crop',
    path: '/women/lowers'
  }
];
const jewelleryCategories = [
  {
    id: 'rings',
    name: 'RINGS',
    image: 'https://i.ibb.co/hJ98rRh6/White-K-Year-of-Snake-Ring.png',
    fit: 'contain',
    path: '/jewellery/rings'
  },
  {
    id: 'pendants',
    name: 'PENDANTS',
    image: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    fit: 'contain',
    path: '/jewellery/pendants'
  },
  {
    id: 'bracelet',
    name: 'BRACELET',
    image: 'https://i.ibb.co/4ZR90MKP/Gold-Year-of-Snake-Bracelet.png',
    fit: 'contain',
    path: '/jewellery/bracelet'
  },
  {
    id: 'earrings',
    name: 'EARRINGS',
    image: 'https://i.ibb.co/y72Tgjg/Earing-set.png',
    fit: 'contain',
    path: '/jewellery/earrings'
  }
];

const accessoriesCategories = [
  {
    id: 'keychain',
    name: 'KEYCHAIN',
    image: 'https://i.ibb.co/fdt5NJjf/Bright-Red-Metallic-Cherry-Keychain.png',
    fit: 'contain',
    path: '/accessories/keychain'
  },
  {
    id: 'toys',
    name: 'TOYS',
    image: stuffedAnimalImg,
    fit: 'cover',
    path: '/accessories/toys'
  }
];
export default function ProductGrid({ categoryFilter = 'all' }: { categoryFilter?: 'all' | 'men' | 'women' | 'jewellery' | 'accessories' | 'rings' | 'pendants' | 'keychain' | 'bracelet' | 'toys' | 'earrings' | 'men-tshirts' | 'men-lowers' | 'women-tshirts' | 'women-lowers' }) {
  const navigate = useNavigate();

  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const { data } = await productsApi.list({ status: 'active', limit: 100 });

        const formatted = (data || []).map((p: any) => {
          const isJewellery = p.category?.toLowerCase() === 'jewellery';
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.compare_price,
            label: `${p.category} Premium`,
            category: isJewellery ? p.subcategory?.toLowerCase() : p.category?.toLowerCase() || '',
            gender: p.category?.toLowerCase() || '',
            type: p.subcategory?.toLowerCase() === 'lowers' ? 'lower' : (p.subcategory?.toLowerCase()?.includes('shirt') ? 'tshirt' : (p.subcategory?.toLowerCase() || 'tshirt')),
            sizes: p.sizes,
            discount: p.discount,
            description: p.description,
            frontImg: p.images?.[0] || '',
            backImg: p.images?.[1] || p.images?.[0] || '',
          };
        });
        setDbProducts(formatted);
      } catch (err) {
        console.error('Failed to fetch DB products', err);
      }
    };
    fetchDbProducts();
  }, [categoryFilter]);

  const dbMenProducts = dbProducts.filter((p: any) => p.gender === 'men');
  const dbWomenProducts = dbProducts.filter((p: any) => p.gender === 'women');
  const dbJewelleryProducts = dbProducts.filter((p: any) => p.gender === 'jewellery');

  const allWomenProducts = dbWomenProducts;
  const displayWomenProducts = categoryFilter === 'all' ? allWomenProducts.slice(0, 3) : allWomenProducts;
  const allJewelleryProducts = dbJewelleryProducts;
  const displayJewelleryProducts = categoryFilter === 'all' ? allJewelleryProducts.slice(0, 3) : allJewelleryProducts;

  const openProduct = (product: any) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };
  return (
    <>
      <AnimatePresence mode="wait">
      {categoryFilter === 'men' && (
        <motion.section 
          key="men"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="men" 
          className="py-[120px] bg-[#12100C] relative z-10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              LATEST DROPS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              Men's Collection
            </motion.h3>
          </div>
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
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1] uppercase">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {dbMenProducts.length > 0 && (
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-8 text-center md:text-left"
              >
                FROM OUR CATALOG
              </motion.h2>
              <div className="pinterest-grid">
                {dbMenProducts.map((item, i) => (
                  <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}
      {['men-tshirts', 'men-lowers', 'women-tshirts', 'women-lowers'].includes(categoryFilter) && (
        <motion.section 
          key="gendered-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="gendered-category" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              {categoryFilter.startsWith('men') ? "MEN'S COLLECTION" : "WOMEN'S COLLECTION"}
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter.startsWith('men') ? "MEN'S " : "WOMEN'S "}
              {categoryFilter.includes('tshirts') ? 'TSHIRTS' : 'LOWERS'}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            {((categoryFilter.startsWith('men') ? dbMenProducts : allWomenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).length === 0 ? (
              <div className="w-full flex justify-center py-24">
                <h3 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1]/50 uppercase">
                  New Collection Coming Soon
                </h3>
              </div>
            ) : categoryFilter.startsWith('men') ? (
              <div className="pinterest-grid">
                {((categoryFilter.startsWith('men') ? dbMenProducts : allWomenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).map((item, i) => (
                  <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
                ))}
              </div>
            ) : (
              <div className="pinterest-grid">
                {((categoryFilter.startsWith('men') ? dbMenProducts : allWomenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).map((item, i) => (
                  <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      )}
      {categoryFilter === 'women' && (
        <motion.section 
          key="women"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="women" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              Women's Collection
            </motion.h3>
          </div>
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
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1] uppercase">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {categoryFilter === 'accessories' && (
        <motion.section 
          key="accessories"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="accessories" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              ACCESSORIES COLLECTION
            </motion.h3>
          </div>
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
                  <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className={`text-3xl font-archivo font-bold tracking-[0.2em] uppercase text-center w-full px-2 ${item.id === 'toys' ? 'text-[#FFE55A]' : 'text-[#EAE6E1]'}`}>
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {categoryFilter === 'jewellery' && (
        <motion.section 
          key="jewellery"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              JEWELLERY COLLECTION
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {jewelleryCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 6) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  {/* Antigravity & Glow Container */}
                  <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    {/* Image with Zoom */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className={`absolute inset-0 w-full h-full ${'fit' in item && item.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100`}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    {/* Centered Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-2xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1] uppercase text-center w-full px-2">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {['rings', 'pendants', 'bracelet', 'earrings'].includes(categoryFilter) && (
        <motion.section 
          key="jewellery-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery-category" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              JEWELLERY
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="pinterest-grid">
              {allJewelleryProducts.filter(p => p.category === categoryFilter).map((item, i) => (
                <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {['keychain', 'toys'].includes(categoryFilter) && (
        <motion.section 
          key="accessories-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="accessories-category" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              ACCESSORIES
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="pinterest-grid">
              {allJewelleryProducts.filter(p => p.category === categoryFilter).map((item, i) => (
                <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
    </>
  );
}