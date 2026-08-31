import SEO from './components/SEO';
import { SEO_CONFIG } from './config/seo';
import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { CollectionScroller } from './components/CollectionScroller';
import './components/CollectionScroller.css';
import { Suspense, lazy, useEffect, useLayoutEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import {
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
  Navigate
} from 'react-router-dom';
import LoginModal from './LoginModal';
import ProductGrid, { getOrFetchAllProducts } from './ProductGrid';
import CartDrawer from './CartDrawer';
import ProductPage from './ProductPage';
import ShinyText from './components';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useAuth } from './hooks/UseAuth';
import { Preloader } from './features/preloader';
import { usePreloader } from './features/PreloaderContext';
import { PageTransitionLoader } from './features/PageTransitionLoader';
import { usePageTransition } from './features/PageTransitionContext';
import { CustomCursor } from './features/CustomCursor';
import { useCollectionTransition } from './features/CollectionTransitionContext';
import heroImage from './assets/hero section try.png';
import jewelleryHeroImage from './assets/jewellery hero section.png';
import accessoriesHeroImage from './assets/accessories hero section.png';
import { useTheme } from './theme/ThemeProvider';
import { TrustSection } from './components/TrustSection';
import { Footer } from './components/Footer';
import TryOnReviewTicker from './components/TryOnReviewTicker';
import HeroCountdown from './features/HeroCountdown';
import { BestSellers } from './components/BestSellers';
import { LAUNCH_CONFIG, COUNTDOWN_START_TIMESTAMP } from './config/launch';

// Code-split everything that isn't the core "browse the storefront /
// view a product" path most visitors are on — the admin panel alone
// (AdminSections.tsx + RichTextEditor) is a large chunk that ~0% of
// storefront visitors ever need to download.
const CheckoutPage = lazy(() => import('./CheckoutPage'));
const BagPage = lazy(() => import('./BagPage'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const AdminGate = lazy(() => import('./admin/AdminGate'));
const ComingSoon = lazy(() => import('./pages/comingsoon/ComingSoon'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const CustomerCare = lazy(() => import('./pages/customerCare'));
const SizeGuide = lazy(() => import('./pages/sizeGuide'));
const ShippingReturns = lazy(() => import('./pages/shippingReturns'));
const PrivacyPolicy = lazy(() => import('./pages/privacyPolicy'));
const TermsOfService = lazy(() => import('./pages/termsOfService'));


export default function App() {
  const { isLoginModalOpen, setIsLoginModalOpen } = useAuthModal();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isClothingOpen, setIsClothingOpen] = useState(false);
  const [isMobileClothingOpen, setIsMobileClothingOpen] = useState(false);
  const clothingDropdownRef = useRef<HTMLDivElement>(null);
  const [isJewelleryOpen, setIsJewelleryOpen] = useState(false);
  const [isMobileJewelleryOpen, setIsMobileJewelleryOpen] = useState(false);
  const jewelleryDropdownRef = useRef<HTMLDivElement>(null);
  const [isAccessoriesOpen, setIsAccessoriesOpen] = useState(false);
  const [isMobileAccessoriesOpen, setIsMobileAccessoriesOpen] = useState(false);
  const accessoriesDropdownRef = useRef<HTMLDivElement>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchIconRef = useRef<HTMLButtonElement>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchProducts, setSearchProducts] = useState<any[]>([]);

  useEffect(() => {
    if (isSearchOpen) {
      getOrFetchAllProducts()
        .then((products) => setSearchProducts(products))
        .catch((err) => console.error('Failed to pre-fetch search products:', err));
    }
  }, [isSearchOpen]);
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [isLiveMode, setIsLiveMode] = useState(() => {
    const now = Date.now();
    const start = COUNTDOWN_START_TIMESTAMP.getTime();
    const end = LAUNCH_CONFIG.brandLaunch.getTime();
    return isAdmin || now < start || now >= end;
  });

  useEffect(() => {
    if (isAdmin) {
      setIsLiveMode(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    const checkLive = () => {
      const now = Date.now();
      const start = COUNTDOWN_START_TIMESTAMP.getTime();
      const end = LAUNCH_CONFIG.brandLaunch.getTime();
      if (isAdmin || now < start || now >= end) {
        setIsLiveMode(true);
      } else {
        setIsLiveMode(false);
      }
    };
    checkLive();
    const interval = setInterval(checkLive, 1000);
    return () => clearInterval(interval);
  }, [isAdmin]);
  const { scrollY } = useScroll();
  const { setIsCartOpen, items } = useCart();
  const { isLoading, hasCompletedOnce } = usePreloader();
  const { trigger: navTransition, isTransitioning } = usePageTransition();
  const isTransitioningRef = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const currentSEO = SEO_CONFIG[location.pathname as keyof typeof SEO_CONFIG] ?? SEO_CONFIG['/'];
  const isHome = location.pathname === '/';

  // Determine whether the current route should be excluded from indexing.
  // Private routes (checkout, bag, profile, admin, auth tokens) should never
  // appear in search results.
  const isPrivateRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/bag') ||
    location.pathname.startsWith('/profile') ||
    location.pathname.startsWith('/verify-email') ||
    location.pathname.startsWith('/reset-password');
  const theme = useTheme();
  const { isCollectionTransitioning } = useCollectionTransition();
  // Derive the hero background image from the active collection theme.
  // Each collection with its own heroImage switches the <img> src in sync;
  // clothing falls back to the default hero image.
  const activeHeroImage =
    theme === 'jewellery' ? jewelleryHeroImage :
    theme === 'accessories' ? accessoriesHeroImage :
    heroImage;

  // Prevent scrolling during preloader (skip on admin)
  useEffect(() => {
    if (isLoading && !location.pathname.startsWith('/admin')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isLoading, location.pathname]);
  
  // Hero animation refs
  const heroRef = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLImageElement>(null);
  const heroAnimatedRef = useRef(false);

  // Subtle hero-image scale pulse during collection transitions.
  // Timed to match the veil: scale up as veil covers, reset as veil reveals.
  useEffect(() => {
    const img = heroImageRef.current;
    if (!img) return;
    if (isCollectionTransitioning) {
      // Very subtle zoom-in as the veil sweeps over
      gsap.to(img, { scale: 1.025, duration: 0.32, ease: 'power2.inOut', overwrite: true });
    } else {
      // Settle back to normal as veil lifts
      gsap.to(img, { scale: 1, duration: 0.42, ease: 'power2.out', overwrite: true });
    }
  }, [isCollectionTransitioning]);

  // Keep isTransitioningRef in sync so event handlers always read latest value
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
  }, [isTransitioning]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clothingDropdownRef.current && !clothingDropdownRef.current.contains(event.target as Node)) {
        setIsClothingOpen(false);
      }
      if (jewelleryDropdownRef.current && !jewelleryDropdownRef.current.contains(event.target as Node)) {
        setIsJewelleryOpen(false);
      }
      if (accessoriesDropdownRef.current && !accessoriesDropdownRef.current.contains(event.target as Node)) {
        setIsAccessoriesOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)
          && searchIconRef.current && !searchIconRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const openSearch = () => {
    setIsSearchOpen(true);
    // Focus after the overlay mounts (one animation frame is enough)
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const handleSearchSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) return;
    // Do NOT close search before navTransition — calling closeSearch() here
    // would trigger a Framer Motion exit animation that races GSAP's curtain
    // animation and leaves [data-page-content] in a broken opacity/transform state.
    // Instead, reset search state inside the navTransition callback, which fires
    // when the curtain fully covers the screen (safe to update state).
    navTransition(() => {
      setIsSearchOpen(false);
      setSearchQuery('');
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  // Auto-close search (instantly, no animation) whenever the route changes.
  // This handles all navigation paths: nav links, browser back/forward, etc.
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  // ── Hero GSAP: hide letters immediately, animate when preloader reveals ──
  const HERO_LETTERS = 'ZEVRAE'.split('');
  const HERO_LETTER_ORDER = [3, 0, 5, 1, 4, 2];

  const resetHero = () => {
    if (!heroRef.current) return;
    heroAnimatedRef.current = false;
    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');
    letters.forEach((el) => gsap.set(el, { yPercent: 110 }));
    if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
    if (infoRow) gsap.set(infoRow, { opacity: 0, y: 20 });
  };

  const runHeroAnimation = () => {
    if (heroAnimatedRef.current || !heroRef.current) return;
    heroAnimatedRef.current = true;

    const letters = heroRef.current.querySelectorAll<HTMLElement>('.zv-hero-letter');
    const line = heroRef.current.querySelector<HTMLElement>('.hero-divider-line');
    const infoRow = heroRef.current.querySelector<HTMLElement>('.hero-info-row');

    if (!letters.length) return;

    const tl = gsap.timeline();

    // Letters slide up — power4.out gives a strong decel right before landing
    // Last letter starts at 5*0.09=0.45s, finishes at 0.45+0.9 = 1.35s
    HERO_LETTER_ORDER.forEach((letterIdx, seqIdx) => {
      tl.to(
        letters[letterIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`,
      );
    });

    // Line: starts at 0s, duration 1.25s → finishes at 1.25s (just before last letter at 1.35s)
    if (line) {
      tl.to(line, { scaleX: 1, duration: 1.25, ease: 'power2.inOut' }, 0);
    }

    // Info row fades up after letters land
    if (infoRow) {
      tl.to(infoRow, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.1);
    }
  };

  // When navigating TO home: always reset elements to hidden.
  // Only auto-play immediately if there's NO active page transition
  // (browser back button, direct URL, HMR — all have no curtain covering the page).
  // NavTransition (clicking ZEVRAE/HOME) uses hero-reveal event instead.
  useEffect(() => {
    if (!isHome) return;
    resetHero();
    if (hasCompletedOnce && !isTransitioningRef.current) {
      setTimeout(runHeroAnimation, 50);
    }
  }, [location.pathname]);

  // Preloader: fires at slide start → delay 500ms = 50% into the 1.0s slide
  useEffect(() => {
    const handle = () => {
      if (!isHome) return;
      setTimeout(runHeroAnimation, 500);
    };
    window.addEventListener('preloader-sliding', handle);
    return () => window.removeEventListener('preloader-sliding', handle);
  }, [isHome]);

  // Page transition: fires when curtain lifts to reveal new page
  useEffect(() => {
    const handle = () => {
      if (!isHome) return;
      // Small delay to let the page content settle before animating
      setTimeout(runHeroAnimation, 100);
    };
    window.addEventListener('hero-reveal', handle);
    return () => window.removeEventListener('hero-reveal', handle);
  }, [isHome]);

  // Luxury animation pacing
  const transition = { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] };
  const staggerTransition = { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] };

  const getDisplayName = () => {
    if (!user) return null;
    if (user.name) return user.name.split(' ')[0].toUpperCase();
    if (user.email) return user.email.split('@')[0].toUpperCase();
    return 'USER';
  };
  
  const displayName = getDisplayName();

return (
  <div data-page-content className="flex flex-col min-h-screen bg-[var(--theme-bg)] text-[var(--theme-text)] selection:bg-[rgba(var(--theme-accent-rgb),0.3)] selection:text-[var(--theme-text)] relative overflow-x-hidden font-sans">
    {/* Premium custom cursor — hidden on touch devices */}
    {currentSEO && (
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        canonical={
          (currentSEO as any).canonicalOverride ||
          `https://zevrae.com${location.pathname === '/' ? '/' : location.pathname}`
        }
        noindex={isPrivateRoute}
      />
    )}
    <CustomCursor />  
    {/* Preloader Overlay — self-manages slide-up exit, never re-renders after completion */}
    {!hasCompletedOnce && !location.pathname.startsWith('/admin') && <Preloader />}
    {/* Page Transition Loader */}
    <PageTransitionLoader />

      {/* Global Film Grain */}
      <div 
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 mix-blend-difference"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      />

      {/* Navigation — hidden on /admin */}
      {!location.pathname.startsWith('/admin') && (
      <nav 
        className="fixed top-0 w-full z-40 flex flex-col"
      >
        {/* Announcement black strip */}
        <div 
          className="w-full bg-black text-white text-center py-2.5 text-[10px] md:text-[12px] tracking-[0.15em] font-plex-mono font-medium uppercase border-b border-white/5"
          style={{ color: '#FFFFFF', backgroundColor: '#000000' }}
        >
          Use coupon <span style={{ color: '#C5A059', fontVariantNumeric: 'lining-nums' }} className="font-semibold lining-nums">ZEV10</span> (applicable for first <span style={{ color: '#C5A059', fontVariantNumeric: 'lining-nums' }} className="font-semibold lining-nums">100</span> customers)
        </div>

        {/* Main Navbar */}
        <div 
          className={`w-full transition-all duration-1000 ${
            isScrolled ? 'bg-[rgba(var(--theme-bg-rgb),0.95)] backdrop-blur-md pt-6 pb-3' : 'bg-transparent pt-10 pb-4'
          }`}
        >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="hidden md:flex space-x-16 text-[12px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
            {isLiveMode && (
              <>
                <div 
                  className="relative" 
              ref={clothingDropdownRef}
              onMouseEnter={() => setIsClothingOpen(true)}
              onMouseLeave={() => setIsClothingOpen(false)}
            >
              <button 
                className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700"
              >
                CLOTHING
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
              </button>

              <AnimatePresence>
                {isClothingOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[calc(100%+1.5rem)] left-0 w-48 bg-[rgba(var(--theme-bg-rgb),0.95)] backdrop-blur-md border border-[rgba(var(--theme-accent-rgb),0.1)] py-4 flex flex-col gap-4 shadow-2xl z-50"
                  >
                    <Link
                      to="/men"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsClothingOpen(false);
                        navTransition(() => navigate('/men'));
                      }}
                      className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                    >
                      MEN
                    </Link>
                    <Link
                      to="/women"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsClothingOpen(false);
                        navTransition(() => navigate('/women'));
                      }}
                      className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                    >
                      WOMEN
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div 
              className="relative" 
              ref={jewelleryDropdownRef}
              onMouseEnter={() => setIsJewelleryOpen(true)}
              onMouseLeave={() => setIsJewelleryOpen(false)}
            >
              <button
                className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700"
              >
                JEWELLERY
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
              </button>

              <AnimatePresence>
                {isJewelleryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[calc(100%+1.5rem)] left-0 w-48 bg-[rgba(var(--theme-bg-rgb),0.95)] backdrop-blur-md border border-[rgba(var(--theme-accent-rgb),0.1)] py-4 flex flex-col gap-4 shadow-2xl z-50"
                  >
                    <Link
                      to="/jewellery/men"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsJewelleryOpen(false);
                        navTransition(() => navigate('/jewellery/men'));
                      }}
                      className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                    >
                      MEN
                    </Link>
                    <Link
                      to="/jewellery/women"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsJewelleryOpen(false);
                        navTransition(() => navigate('/jewellery/women'));
                      }}
                      className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                    >
                      WOMEN
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div 
              className="relative" 
              ref={accessoriesDropdownRef}
              onMouseEnter={() => setIsAccessoriesOpen(true)}
              onMouseLeave={() => setIsAccessoriesOpen(false)}
            >
              <button className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700">
                ACCESSORIES
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
              </button>

              <AnimatePresence>
                {isAccessoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3 }}
                    className="absolute top-[calc(100%+1.5rem)] left-0 w-48 bg-[rgba(var(--theme-bg-rgb),0.95)] backdrop-blur-md border border-[rgba(var(--theme-accent-rgb),0.1)] py-4 flex flex-col gap-4 shadow-2xl z-50"
                  >
                    <Link
                      to="/accessories/keychains"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAccessoriesOpen(false);
                        navTransition(() => navigate('/accessories/keychains'));
                      }}
                      className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                    >
                      KEYCHAINS
                    </Link>
                    <Link
                      to="/accessories/soft-toys"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAccessoriesOpen(false);
                        navTransition(() => navigate('/accessories/soft-toys'));
                      }}
                      className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                    >
                      SOFT TOYS
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

          <motion.button 
            onClick={() => navTransition(() => { navigate('/'); })}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.2 }}
            className="text-xl md:text-3xl font-archivo font-bold tracking-[0.1em] absolute left-1/2 transform -translate-x-1/2 text-[var(--theme-text)] cursor-pointer"
            style={{ fontStretch: '125%' }}
          >
            ZEVRAE
          </motion.button>

          <div className="hidden md:flex items-center space-x-16 text-[12px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
            {isLiveMode ? (
              <>
                {/* ── Search icon — opens overlay panel below nav ── */}
                <button
                  ref={searchIconRef}
                  onClick={isSearchOpen ? closeSearch : openSearch}
                  aria-label="Search"
                  aria-expanded={isSearchOpen}
                  className="flex items-center text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-text)] transition-colors duration-300"
                >
                  <Search size={15} strokeWidth={1.25} />
                </button>

                {isAdmin && (
                  <button onClick={() => navTransition(() => navigate('/admin'))} className="group relative pb-1 hover:text-[var(--theme-accent)] text-[12px] font-bold transition-colors duration-700">
                    ADMIN PANEL
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[var(--theme-accent)] nav-underline" />
                  </button>
                )}
                {!isAdmin && (
                  <button
                    type="button"
                    className="group relative pb-1 font-plex-mono transition-colors duration-700 hover:text-[var(--theme-text)]"
                    onClick={() => navTransition(() => navigate('/ai-wardrobe'))}
                  >
                    <ShinyText
                      text="AI WARDROBE"
                      speed={2.2}
                      className="text-[12px] uppercase tracking-[0.3em] font-plex-mono"
                      color="var(--theme-accent)"
                      shineColor="#FFFFFF"
                    />
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                  </button>
                )}
                {user ? (
                  <div 
                    className="relative" 
                    ref={profileDropdownRef}
                    onMouseEnter={() => setIsProfileOpen(true)}
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <button 
                      className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700 uppercase"
                    >
                      {displayName}
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                    </button>
                    <AnimatePresence>
                      {isProfileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-[calc(100%+1.5rem)] right-0 w-48 bg-[rgba(var(--theme-bg-rgb),0.95)] backdrop-blur-md border border-[rgba(var(--theme-accent-rgb),0.1)] py-4 flex flex-col gap-4 shadow-2xl z-50"
                        >
                          <button 
                            onClick={() => {
                              setIsProfileOpen(false);
                              navTransition(() => navigate('/profile'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em] uppercase"
                          >
                            PROFILE
                          </button>
                          <button 
                            onClick={() => {
                              setIsProfileOpen(false);
                              logout();
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em] uppercase"
                          >
                            LOGOUT
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <button onClick={() => navTransition(() => setIsLoginModalOpen(true))} className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700">
                    LOGIN
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                  </button>
                )}
                <button onClick={() => navTransition(() => navigate('/bag'))} className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700">
                  BAG({items.reduce((total, item) => total + item.quantity, 0)})
                  <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                </button>
              </>
            ) : (
              <>
                {user ? (
                  <button onClick={() => logout()} className="group relative pb-1 hover:text-[var(--theme-accent)] transition-colors duration-700">
                    LOGOUT
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                  </button>
                ) : (
                  <button onClick={() => setIsLoginModalOpen(true)} className="group relative pb-1 hover:text-[var(--theme-accent)] transition-colors duration-700">
                    ADMIN LOGIN
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                  </button>
                )}
              </>
            )}
          </div>

          {isLiveMode ? (
            <button 
              className="md:hidden z-40 relative text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={28} strokeWidth={1} />
            </button>
          ) : (
            <button 
              onClick={() => user ? logout() : setIsLoginModalOpen(true)}
              className="md:hidden z-40 relative text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300 text-[10px] tracking-[0.2em] font-plex-mono uppercase"
            >
              {user ? 'LOGOUT' : 'ADMIN LOGIN'}
            </button>
          )}
        </div>
        </div>

        {/* ── Search overlay — sits below the nav bar, never overlaps the logo ── */}
        <AnimatePresence>
          {isSearchOpen && !location.pathname.startsWith('/admin') && (
            <motion.div
              key="search-overlay"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute top-full left-0 w-full z-30 flex justify-center"
              style={{
                borderBottom: '1px solid rgba(var(--theme-accent-rgb), 0.12)',
                backgroundColor: 'rgba(var(--theme-bg-rgb), 0.97)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              <div
                ref={searchContainerRef}
                className="w-full max-w-[600px] px-6 py-5 flex flex-col gap-1"
              >
                <div className="flex items-center gap-4 w-full">
                  {/* Thin gold-tinted magnifying glass at start of field */}
                  <Search
                    size={13}
                    strokeWidth={1.25}
                    className="flex-shrink-0"
                    style={{ color: 'rgba(var(--theme-accent-rgb), 0.55)' }}
                  />

                  <form onSubmit={handleSearchSubmit} className="flex-1">
                    <input
                      ref={searchInputRef}
                      id="header-search-input"
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SEARCH PRODUCTS..."
                      className="w-full bg-transparent outline-none
                        text-[11px] tracking-[0.28em] font-plex-mono
                        text-[rgba(var(--theme-text-rgb),0.85)]
                        placeholder:text-[rgba(var(--theme-text-rgb),0.28)]
                        border-0 border-b border-[rgba(var(--theme-accent-rgb),0.2)]
                        focus:border-[rgba(var(--theme-accent-rgb),0.5)]
                        transition-[border-color] duration-300
                        pb-1"
                      aria-label="Search products"
                    />
                  </form>

                  {/* Close button */}
                  <button
                    onClick={closeSearch}
                    aria-label="Close search"
                    className="flex-shrink-0 text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[rgba(var(--theme-text-rgb),0.7)] transition-colors duration-200"
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Live suggestions */}
                {searchQuery.trim().length > 0 && (
                  <div className="w-full max-h-[300px] overflow-y-auto mt-3 flex flex-col gap-2 pb-1 border-t border-[rgba(var(--theme-accent-rgb),0.08)] pt-4 z-50">
                    {(() => {
                      const query = searchQuery.trim().toLowerCase();
                      const queryWords = query.split(/\s+/).filter(Boolean);
                      
                      const suggestions = searchProducts.filter(p => {
                        const nameLower = (p.name || '').toLowerCase();
                        const catLower = (p.rawCategory || p.gender || '').toLowerCase();
                        const subcatLower = (p.rawSubcategory || p.category || '').toLowerCase();
                        
                        return queryWords.every(word =>
                          nameLower.includes(word) ||
                          catLower.includes(word) ||
                          subcatLower.includes(word)
                        );
                      });

                      if (suggestions.length === 0) {
                        return (
                          <div className="text-[10px] tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] py-2 uppercase text-center">
                            No matching products found
                          </div>
                        );
                      }

                      return suggestions.slice(0, 5).map(product => {
                        const formattedPrice = new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0
                        }).format(product.price);

                        const raw = product.rawCategory || product.category || '';
                        const sub = product.rawSubcategory || product.type || '';
                        let catLabel = '';
                        if (raw.toLowerCase().startsWith('jewellery')) {
                          const gender = raw.toLowerCase().includes('men') ? 'MEN' : 'WOMEN';
                          catLabel = sub ? `JEWELLERY / ${sub.toUpperCase()}` : `JEWELLERY — ${gender}`;
                        } else if (raw.toLowerCase() === 'accessories') {
                          catLabel = sub ? `ACCESSORIES / ${sub.toUpperCase()}` : 'ACCESSORIES';
                        } else {
                          const genderLabel = product.gender === 'women' ? 'WOMEN' : 'MEN';
                          catLabel = sub ? `${genderLabel} / ${sub.toUpperCase()}` : genderLabel;
                        }

                        return (
                          <div
                            key={product.id}
                            onClick={() => {
                              navTransition(() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                                navigate(`/product/${product.id}`, { state: { product } });
                              });
                            }}
                            className="flex items-center gap-4 p-2 hover:bg-[rgba(var(--theme-accent-rgb),0.04)] rounded-sm cursor-pointer transition-colors duration-300 group"
                          >
                            <img
                              src={product.frontImg}
                              alt={product.name}
                              className="w-10 h-14 object-cover bg-[var(--theme-surface)] rounded-sm group-hover:scale-[1.02] transition-transform duration-300"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-[8px] font-plex-mono tracking-[0.3em] text-[rgba(var(--theme-accent-rgb),0.6)] uppercase mb-1">
                                {catLabel}
                              </p>
                              <p className="text-[11px] font-archivo font-bold tracking-[0.05em] text-[var(--theme-text)] uppercase group-hover:text-[var(--theme-accent)] transition-colors duration-300 truncate">
                                {product.name}
                              </p>
                            </div>
                            <div className="text-[11px] font-plex-mono tracking-[0.1em] text-[rgba(var(--theme-accent-rgb),0.85)]">
                              {formattedPrice}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      )}

      {/* Fullscreen Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && !location.pathname.startsWith('/admin') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[var(--theme-bg)] z-50 flex flex-col items-center justify-center space-y-12"
          >
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-10 right-6 md:right-12 text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300"
            >
              <X size={28} strokeWidth={1} />
            </button>

            {/* Mobile search bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = mobileSearchQuery.trim();
                if (!trimmed) return;
                setMobileSearchQuery('');
                setIsMenuOpen(false);
                navTransition(() => navigate(`/search?q=${encodeURIComponent(trimmed)}`));
              }}
              className="flex items-center gap-3 border-b border-[rgba(var(--theme-text-rgb),0.2)] pb-3 w-64"
            >
              <Search size={14} strokeWidth={1.25} className="text-[rgba(var(--theme-text-rgb),0.4)] flex-shrink-0" />
              <input
                type="text"
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                placeholder="SEARCH PRODUCTS..."
                className="flex-1 bg-transparent outline-none text-[11px] tracking-[0.25em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.8)] placeholder:text-[rgba(var(--theme-text-rgb),0.3)] py-1"
                aria-label="Search products"
              />
              {mobileSearchQuery && (
                <button
                  type="button"
                  onClick={() => setMobileSearchQuery('')}
                  className="text-[rgba(var(--theme-text-rgb),0.3)] hover:text-[rgba(var(--theme-text-rgb),0.7)] transition-colors"
                >
                  <X size={11} strokeWidth={1.5} />
                </button>
              )}
            </form>
            {[
              // Dropdown-toggle items keep href='#' (they expand a submenu, not navigate)
              { name: 'Clothing', href: '#', onClick: () => setIsMobileClothingOpen(!isMobileClothingOpen) },
              ...(isMobileClothingOpen ? [
                { name: '- Men', href: '/men', onClick: () => { navTransition(() => navigate('/men')); setIsMenuOpen(false); setIsMobileClothingOpen(false); }, isSubItem: true },
                { name: '- Women', href: '/women', onClick: () => { navTransition(() => navigate('/women')); setIsMenuOpen(false); setIsMobileClothingOpen(false); }, isSubItem: true },
              ] : []),
              { name: 'Jewellery', href: '#', onClick: () => setIsMobileJewelleryOpen(!isMobileJewelleryOpen) },
              ...(isMobileJewelleryOpen ? [
                { name: '- Men', href: '/jewellery/men', onClick: () => { navTransition(() => navigate('/jewellery/men')); setIsMenuOpen(false); setIsMobileJewelleryOpen(false); }, isSubItem: true },
                { name: '- Women', href: '/jewellery/women', onClick: () => { navTransition(() => navigate('/jewellery/women')); setIsMenuOpen(false); setIsMobileJewelleryOpen(false); }, isSubItem: true },
              ] : []),
              { name: 'Accessories', href: '#', onClick: () => setIsMobileAccessoriesOpen(!isMobileAccessoriesOpen) },
              ...(isMobileAccessoriesOpen ? [
                { name: '- Keychains', href: '/accessories/keychains', onClick: () => { navTransition(() => navigate('/accessories/keychains')); setIsMenuOpen(false); setIsMobileAccessoriesOpen(false); }, isSubItem: true },
                { name: '- Soft Toys', href: '/accessories/soft-toys', onClick: () => { navTransition(() => navigate('/accessories/soft-toys')); setIsMenuOpen(false); setIsMobileAccessoriesOpen(false); }, isSubItem: true },
              ] : []),
              // AI Wardrobe: real destination exposed
              ...(isAdmin ? [] : [{ name: 'AI Wardrobe', href: '/ai-wardrobe', onClick: () => { navTransition(() => navigate('/ai-wardrobe')); setIsMenuOpen(false); } }]),
              // Admin Panel: action-like, keep '#'
              ...(isAdmin 
                ? [{ name: 'Admin Panel', href: '#', onClick: () => { navTransition(() => navigate('/admin')); setIsMenuOpen(false); } }]
                : []),
              ...(user ? [
                // Profile toggle: keep '#' (expands sub-items)
                { name: displayName || 'USER', href: '#', onClick: () => setIsMobileProfileOpen(!isMobileProfileOpen) },
                ...(isMobileProfileOpen ? [
                  // Profile sub-item: real destination
                  { name: '- Profile', href: '/profile', onClick: () => { navTransition(() => navigate('/profile')); setIsMenuOpen(false); setIsMobileProfileOpen(false); }, isSubItem: true },
                  // Logout is an action, not a page — keep '#'
                  { name: '- Logout', href: '#', onClick: () => { logout(); setIsMenuOpen(false); setIsMobileProfileOpen(false); }, isSubItem: true },
                ] : [])
              ] : [
                // Login is an action (opens modal) — keep '#'
                { name: 'Login', href: '#', onClick: () => { navTransition(() => setIsLoginModalOpen(true)); setIsMenuOpen(false); } }
              ]),
              // Bag: real destination
              { name: `Bag(${items.reduce((total, item) => total + item.quantity, 0)})`, href: '/bag', onClick: () => { navTransition(() => navigate('/bag')); setIsMenuOpen(false); } }
            ].map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={`text-3xl md:text-5xl font-plex-mono tracking-[0.2em] text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300 uppercase ${item.isSubItem ? 'text-xl md:text-3xl my-2' : ''}`}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  } else {
                    setIsMenuOpen(false);
                  }
                }}
              >
                {item.name}
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section — centered layout with ZEVRAE animations */}
      {isHome && (
        <>
          <section
            ref={heroRef}
            className="relative bg-[var(--theme-bg)] overflow-hidden min-h-screen flex flex-col items-center justify-center"
          >
            {/* ── PHOTO PLACEHOLDER — replace src with <video> when ready ── */}
            <img
              ref={heroImageRef}
              src={activeHeroImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                filter: 'brightness(var(--hero-brightness)) saturate(1.1)',
                objectPosition: 'var(--hero-object-position)',
                transformOrigin: 'center center',
                willChange: 'transform',
              }}
            />
            {/* Warm amber vignette to enhance yellow-black feel */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 60%, rgba(var(--theme-accent-rgb),0.08) 0%, rgba(10,10,10,var(--hero-vignette-opacity)) 70%)' }}
            />
            {/* Theme background tint overlay for image readability */}
            <div
              className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.1)]"
              style={{
                backgroundColor: 'rgba(var(--hero-tint-color-rgb, var(--theme-bg-rgb)), var(--hero-tint-opacity, 0))',
                transition: 'background-color 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
              }}
            />

            {/* All hero text — sits above background layers */}
            <div className="relative z-10 flex flex-col items-center">

            {/* ZEVRAE block: text + white line (line = same width as text) */}
            <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>

              {/* Giant ZEVRAE — letters slide up via GSAP */}
              <h1
                className="font-archivo font-extrabold uppercase text-[var(--theme-text)] text-center"
                style={{
                  fontSize: 'clamp(3rem, 14vw, 18rem)',
                  fontStretch: '125%',
                  letterSpacing: '-0.02em',
                  lineHeight: 0.88,
                  margin: 0,
                }}
                aria-label="ZEVRAE"
              >
                {HERO_LETTERS.map((letter, i) => (
                  <span key={`hero-${letter}-${i}`} className="inline-block overflow-hidden" style={{ lineHeight: 1 }}>
                    <span
                      className="zv-hero-letter inline-block"
                      style={{ willChange: 'transform' }}
                    >
                      {letter}
                    </span>
                  </span>
                ))}
              </h1>

              {/* White line — draws left→right, same width as ZEVRAE text */}
              <div
                className="hero-divider-line"
                style={{
                  height: '1.5px',
                  background: 'var(--theme-text)',
                  width: '100%',
                  marginTop: '0.6rem',
                }}
              />

              {/* Tagline — centered inside text width */}
              <p
                className="font-sans italic text-[rgba(var(--theme-text-rgb),0.6)] text-center"
                style={{ fontSize: '0.9rem', marginTop: '1.4rem', letterSpacing: '0.01em' }}
              >
                Luxury is a Matter of Choice
              </p>

              {/* Countdown embedded directly below quote */}
              {!isLiveMode && (
                <HeroCountdown onLive={() => setIsLiveMode(true)} />
              )}

              {/* Bottom row: links left + gold dot right */}
              

            </div>

            </div>{/* end z-10 wrapper */}
          </section>

          {isLiveMode && (
            <>
              {/* Collection Scroller */}
              <CollectionScroller />

              {/* Best Sellers — dynamically driven by the active collection tab */}
              <BestSellers />

              {/* Trust / About section — explains what Zevrae does and why
                  Google Sign-In is offered, required for Google OAuth
                  verification. Styled to match the rest of the homepage. */}
              <TrustSection />
            </>
          )}
        </>
      )}

      <div className="flex-grow">
      <Suspense
        fallback={
          <div className="min-h-screen bg-[var(--theme-bg)] flex items-center justify-center">
            <div className="w-6 h-6 border border-[rgba(var(--theme-accent-rgb),0.3)] border-t-[var(--theme-accent)] rounded-full animate-spin" />
          </div>
        }
      >
        <Routes>
        {isLiveMode ? (
          <>
            <Route path="/" element={<ProductGrid categoryFilter="all" />} />
            <Route path="/search" element={<ProductGrid categoryFilter="search" />} />
            <Route path="/men" element={<ProductGrid categoryFilter="men" />} />
            <Route path="/men/tshirts" element={<ProductGrid categoryFilter="men-tshirts" />} />
            <Route path="/men/lowers" element={<ProductGrid categoryFilter="men-lowers" />} />
            <Route path="/women" element={<ProductGrid categoryFilter="women" />} />
            <Route path="/women/tshirts" element={<ProductGrid categoryFilter="women-tshirts" />} />
            <Route path="/women/lowers" element={<ProductGrid categoryFilter="women-lowers" />} />
            <Route path="/jewellery" element={<ProductGrid categoryFilter="jewellery-men" />} />
            {/* Men's Jewellery */}
            <Route path="/jewellery/men" element={<ProductGrid categoryFilter="jewellery-men" />} />
            <Route path="/jewellery/men/rings" element={<ProductGrid categoryFilter="men-rings" />} />
            <Route path="/jewellery/men/pendants" element={<ProductGrid categoryFilter="men-pendants" />} />
            <Route path="/jewellery/men/bracelets" element={<ProductGrid categoryFilter="men-bracelets" />} />
            <Route path="/jewellery/men/earrings" element={<ProductGrid categoryFilter="men-earrings" />} />
            {/* Women's Jewellery */}
            <Route path="/jewellery/women" element={<ProductGrid categoryFilter="jewellery-women" />} />
            <Route path="/jewellery/women/rings" element={<ProductGrid categoryFilter="women-rings" />} />
            <Route path="/jewellery/women/pendants" element={<ProductGrid categoryFilter="women-pendants" />} />
            <Route path="/jewellery/women/bracelets" element={<ProductGrid categoryFilter="women-bracelets" />} />
            <Route path="/jewellery/women/earrings" element={<ProductGrid categoryFilter="women-earrings" />} />
            <Route path="/accessories" element={<ProductGrid categoryFilter="accessories" />} />
            <Route path="/accessories/keychain" element={<ProductGrid categoryFilter="keychains" />} />
            <Route path="/accessories/keychains" element={<ProductGrid categoryFilter="keychains" />} />
            <Route path="/accessories/toys" element={<ProductGrid categoryFilter="soft-toys" />} />
            <Route path="/accessories/soft-toys" element={<ProductGrid categoryFilter="soft-toys" />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/bag" element={<BagPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/customer-care" element={<CustomerCare />} />
            <Route path="/size-guide" element={<SizeGuide />} />
            <Route path="/shipping-returns" element={<ShippingReturns />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/ai-wardrobe" element={<ComingSoon />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/" replace />} />
        )}
        <Route path="/admin" element={<AdminGate />} />
        <Route path="/admin/orders" element={<AdminGate />} />
        <Route path="/admin/products" element={<AdminGate />} />
        <Route path="/admin/collections" element={<AdminGate />} />
        <Route path="/admin/categories" element={<AdminGate />} />
        <Route path="/admin/discounts" element={<AdminGate />} />
        <Route path="/admin/analysis" element={<AdminGate />} />
      </Routes>
      </Suspense>
      </div>


      {/* Try-On Review Ticker — visible on all non-admin pages, just above Footer */}
      {!location.pathname.startsWith('/admin') && isLiveMode && <TryOnReviewTicker />}
      {/* Footer */}
      {!location.pathname.startsWith('/admin') && isLiveMode && <Footer />}

      <CartDrawer />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}


