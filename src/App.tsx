import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';
import ProductGrid from './ProductGrid';
import CartDrawer from './CartDrawer';
import CheckoutPage from './CheckoutPage';
import Admin from './Admin';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { supabase } from './supabaseClient';
import { Preloader } from './features/preloader';
import { usePreloader } from './features/PreloaderContext';
import { PageTransitionLoader } from './features/PageTransitionLoader';
import { usePageTransition } from './features/PageTransitionContext';

function CampaignSection() {
  const editorialRef = useRef(null);
  const { scrollYProgress: editorialScroll } = useScroll({ 
    target: editorialRef,
    offset: ["start end", "end start"]
  });
  // const editorialY = useTransform(editorialScroll, [0, 1], [50, -50]);

  return (
    <section id="campaign" ref={editorialRef} className="py-[160px] px-6 md:px-12 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-32 items-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-2 md:order-1 pr-0 md:pr-16"
        >
          <h2 className="text-[10px] uppercase tracking-[0.4em] font-serif text-[#EAE6E1]/50 mb-12">
            CAMPAIGN
          </h2>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-light mb-12 leading-tight text-[#EAE6E1] tracking-[0.05em]">
            Autumn / Winter 2026
          </h3>
          <p className="text-[#EAE6E1]/60 font-serif leading-relaxed text-[13px] md:text-[14px] max-w-md tracking-[0.02em]">
            A study in architectural minimalism. The new collection explores the tension between structured tailoring and fluid drape, crafted from the finest European textiles. Each piece is designed with an uncompromising focus on form, function, and enduring elegance.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
          className="order-1 md:order-2 relative"
        >
          <div className="aspect-[4/5] overflow-hidden bg-[#111111]">
            <img 
              src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?q=80&w=1974&auto=format&fit=crop" 
              alt="Campaign" 
              className="w-full h-full object-cover opacity-70 grayscale-[30%]"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#0a0a0a]/20 mix-blend-multiply" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function App() {
  const { isLoginModalOpen, setIsLoginModalOpen } = useAuthModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { scrollY } = useScroll();
  const { setIsCartOpen, items } = useCart();
  const { isLoading } = usePreloader();
  const { trigger: navTransition } = usePageTransition();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  // Prevent scrolling during preloader
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLoading]);
  
  // Parallax effects
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  useEffect(() => {
    const checkAdminStatus = async (u: any) => {
      if (u && u.email) {
        if (u.email === 'officialzevrae@gmail.com') {
          setIsAdmin(true);
          return;
        }

        try {
          const { data } = await supabase.from('admin_users').select('*').eq('email', u.email);
          setIsAdmin(data && data.length > 0);
        } catch (e) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user || null;
      setUser(u);
      checkAdminStatus(u);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setUser(u);
      checkAdminStatus(u);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Luxury animation pacing
  const transition = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };
  const staggerTransition = { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] };

  const getDisplayName = () => {
    if (!user) return null;
    const fullName = user.user_metadata?.full_name;
    if (fullName) return fullName.split(' ')[0].toUpperCase();
    const email = user.email;
    if (email) return email.split('@')[0].toUpperCase();
    return 'USER';
  };
  
  const displayName = getDisplayName();

return (
  <div className="min-h-screen bg-[#0a0a0a] text-[#EAE6E1] selection:bg-[#C5A059]/30 selection:text-[#EAE6E1] relative overflow-x-hidden font-sans">
    {/* Preloader Overlay */}
    {isLoading && <Preloader />}
    {/* Page Transition Loader */}
    <PageTransitionLoader />
{/* HERO BACKGROUND VIDEO */}
<div className="relative w-full h-screen overflow-hidden">
  <video
    autoPlay
    muted
    loop
    playsInline
    className="w-full h-full object-cover"
  >
    <source src="/packaging.mp4" type="video/mp4" />
  </video>
</div>
<div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
      {/* Global Film Grain */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 mix-blend-difference"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Navigation */}
      <nav 
        className={`fixed top-0 w-full z-40 transition-all duration-1000 ${
          isScrolled ? 'bg-[#0a0a0a]/95 backdrop-blur-md py-6 border-b border-[#C5A059]/10' : 'bg-transparent py-10'
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="hidden md:flex space-x-16 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/70">
            <button onClick={() => navTransition(() => { navigate('/'); })} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              HOME
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
            <button onClick={() => navTransition(() => navigate('/men'))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              MEN
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
            <button onClick={() => navTransition(() => navigate('/women'))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              WOMEN
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
            <button onClick={() => navTransition(() => navigate('/jewellery'))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              JEWELLERY
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
          </div>

          <motion.a 
            href="#"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.2 }}
            className="text-xl md:text-3xl font-archivo font-bold tracking-[0.1em] absolute left-1/2 transform -translate-x-1/2 text-[#EAE6E1]"
            style={{ fontStretch: '125%' }}
          >
            ZEVRAE
          </motion.a>

          <div className="hidden md:flex space-x-16 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/70">
            {isAdmin && (
              <button onClick={() => navTransition(() => navigate('/admin'))} className="group relative overflow-hidden pb-1 hover:text-[#C5A059] text-[10px] font-bold transition-colors duration-700">
                ADMIN PANEL
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059] transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </button>
            )}
            {user ? (
              <button onClick={() => supabase.auth.signOut()} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
                {displayName} | LOGOUT
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </button>
            ) : (
              <button onClick={() => navTransition(() => setIsLoginModalOpen(true))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
                LOGIN
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
              </button>
            )}
            <button onClick={() => navTransition(() => setIsCartOpen(true))} className="group relative overflow-hidden pb-1 hover:text-[#EAE6E1] transition-colors duration-700">
              CART {items.length > 0 && `(${items.length})`}
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/40 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
            </button>
          </div>

          <button 
            className="md:hidden z-40 relative text-[#EAE6E1] hover:text-[#C5A059] transition-colors duration-300"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={28} strokeWidth={1} />
          </button>
        </div>
      </nav>

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col items-center justify-center space-y-12"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-10 right-6 md:right-12 text-[#EAE6E1] hover:text-[#C5A059] transition-colors duration-300"
            >
              <X size={28} strokeWidth={1} />
            </button>
            {[
              { name: 'Home', href: '#collection', onClick: () => { navTransition(() => { navigate('/'); }); setIsMenuOpen(false); } },
              { name: 'Men Wear', href: '#collection', onClick: () => { navTransition(() => navigate('/men')); setIsMenuOpen(false); } },
              { name: 'Women Wear', href: '#collection', onClick: () => { navTransition(() => navigate('/women')); setIsMenuOpen(false); } },
              { name: 'Jewellery', href: '#collection', onClick: () => { navTransition(() => navigate('/jewellery')); setIsMenuOpen(false); } },
              ...(isAdmin 
                ? [{ name: 'Admin Panel', href: '#', onClick: () => { navTransition(() => navigate('/admin')); setIsMenuOpen(false); } }]
                : []),
              user 
                ? { name: `${displayName} | Logout`, href: '#', onClick: () => { supabase.auth.signOut(); setIsMenuOpen(false); } }
                : { name: 'Login', href: '#', onClick: () => { navTransition(() => setIsLoginModalOpen(true)); setIsMenuOpen(false); } },
              { name: `Cart (${items.length})`, href: '#', onClick: () => { navTransition(() => setIsCartOpen(true)); setIsMenuOpen(false); } }
            ].map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-3xl md:text-5xl font-plex-mono tracking-[0.2em] text-[#EAE6E1] hover:text-[#C5A059] transition-colors duration-300 uppercase"
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsMenuOpen(false);
                }}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      {isHome && (
        <>
          <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
            <div className="relative z-20 text-center px-4 w-full flex flex-col items-center mt-12">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="mb-12"
              >
                <p className="text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-plex-mono text-[#EAE6E1]/60">
                  AUTUMN / WINTER 2026
                </p>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="font-archivo font-bold tracking-[0.1em] leading-none text-[#EAE6E1] relative z-10 py-4"
                style={{ fontSize: 'clamp(3rem, 7vw, 7rem)', fontStretch: '125%' }}
              >
                ZEVRAE
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-8"
              >
                <p className="text-[11px] md:text-[13px] font-sans italic text-[#EAE6E1]/50 tracking-[0.05em]">
                  The Architecture of Elegance
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 2, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                className="mt-20 flex space-x-16 text-[10px] uppercase tracking-[0.3em] font-plex-mono text-[#EAE6E1]/70"
              >
                <a href="#collection" className="hover:text-[#EAE6E1] transition-colors duration-500 relative group pb-1">
                  View Collection
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/30 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
                </a>
                <a href="#lookbook" className="hover:text-[#EAE6E1] transition-colors duration-500 relative group pb-1">
                  Lookbook
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#C5A059]/30 transform origin-left scale-x-0 transition-transform duration-700 ease-out group-hover:scale-x-100" />
                </a>
              </motion.div>
            </div>
          </section>

          {/* Category Entry Section */}
          <section className="py-[160px] bg-[#0a0a0a]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-col md:flex-row justify-between items-center space-y-16 md:space-y-0 text-xl md:text-2xl lg:text-3xl font-serif font-light tracking-[0.2em] text-[#EAE6E1]/80"
              >
                <button onClick={() => navTransition(() => navigate('/women'))} className="hover:text-[#EAE6E1] transition-colors duration-700 uppercase">WOMEN</button>
                <button onClick={() => navTransition(() => navigate('/men'))} className="hover:text-[#EAE6E1] transition-colors duration-700 uppercase">MEN</button>
                <button onClick={() => navTransition(() => navigate('/jewellery'))} className="hover:text-[#EAE6E1] transition-colors duration-700 uppercase">JEWELLERY</button>
                <a href="#accessories" className="hover:text-[#EAE6E1] transition-colors duration-700">ACCESSORIES</a>
                <a href="#footwear" className="hover:text-[#EAE6E1] transition-colors duration-700">FOOTWEAR</a>
              </motion.div>
            </div>
          </section>
        </>
      )}

      <Routes>
        <Route path="/" element={<ProductGrid categoryFilter="all" />} />
        <Route path="/men" element={<ProductGrid categoryFilter="men" />} />
        <Route path="/men/tshirts" element={<ProductGrid categoryFilter="men-tshirts" />} />
        <Route path="/men/lowers" element={<ProductGrid categoryFilter="men-lowers" />} />
        <Route path="/women" element={<ProductGrid categoryFilter="women" />} />
        <Route path="/women/tshirts" element={<ProductGrid categoryFilter="women-tshirts" />} />
        <Route path="/women/lowers" element={<ProductGrid categoryFilter="women-lowers" />} />
        <Route path="/jewellery" element={<ProductGrid categoryFilter="jewellery" />} />
        <Route path="/jewellery/rings" element={<ProductGrid categoryFilter="rings" />} />
        <Route path="/jewellery/pendants" element={<ProductGrid categoryFilter="pendants" />} />
        <Route path="/jewellery/keychain" element={<ProductGrid categoryFilter="keychain" />} />
        <Route path="/jewellery/bracelet" element={<ProductGrid categoryFilter="bracelet" />} />
        <Route path="/jewellery/toys" element={<ProductGrid categoryFilter="toys" />} />
        <Route path="/jewellery/earrings" element={<ProductGrid categoryFilter="earrings" />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/orders" element={<Admin />} />
      </Routes>

      {isHome && (
        <>
          <CampaignSection />

          {/* Global Presence Section */}
          <section className="py-[160px] bg-[#0a0a0a]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex flex-row flex-wrap justify-center items-center gap-16 md:gap-32 text-[10px] uppercase tracking-[0.4em] font-serif text-[#EAE6E1]/50"
              >
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">PARIS</span>
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">MILAN</span>
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">TOKYO</span>
                <span className="hover:text-[#EAE6E1] transition-colors duration-700 cursor-default">NEW YORK</span>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="bg-[#0a0a0a] pt-[160px] pb-16 px-6 md:px-12 border-t border-[#C5A059]/10">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-32">
            <div className="col-span-1 md:col-span-4">
              <h2 className="text-xl font-serif font-light tracking-[0.3em] mb-12 text-[#EAE6E1]">ZEVRAE</h2>
              <div className="mt-8 flex border-b border-[#EAE6E1]/20 pb-3 max-w-xs group focus-within:border-[#C5A059]/40 transition-colors duration-700">
                <input 
                  type="email" 
                  placeholder="Newsletter" 
                  className="bg-transparent border-none outline-none w-full text-[11px] font-serif placeholder:text-[#EAE6E1]/30 text-[#EAE6E1] tracking-[0.1em]"
                />
                <button className="text-[9px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/50 hover:text-[#EAE6E1] transition-colors duration-500">
                  Subscribe
                </button>
              </div>
            </div>
            
            <div className="col-span-1 md:col-span-2 md:col-start-7">
              <ul className="space-y-6 text-[11px] font-serif text-[#EAE6E1]/60 tracking-[0.05em]">
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Customer Care</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Shipping</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Returns</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Size Guide</a></li>
              </ul>
            </div>

            <div className="col-span-1 md:col-span-2">
              <ul className="space-y-6 text-[11px] font-serif text-[#EAE6E1]/60 tracking-[0.05em]">
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Legal</a></li>
                <li><a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Privacy</a></li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-[#EAE6E1]/10 text-[10px] font-serif text-[#EAE6E1]/40 tracking-[0.1em]">
            <p>&copy; {new Date().getFullYear()} ZEVRAE.</p>
            <div className="flex space-x-12 mt-8 md:mt-0">
              <a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Instagram</a>
              <a href="#" className="hover:text-[#EAE6E1] transition-colors duration-500">Twitter</a>
            </div>
          </div>
        </div>
      </footer>

      <CartDrawer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
