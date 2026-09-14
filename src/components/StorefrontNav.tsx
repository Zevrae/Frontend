'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Menu, X, Search } from 'lucide-react';
import { useCart } from '../CartContext';
import { useAuthModal } from '../AuthModalContext';
import { useAuth } from '../hooks/UseAuth';
import { usePageTransition } from '../features/PageTransitionContext';
import { LAUNCH_CONFIG, COUNTDOWN_START_TIMESTAMP } from '../config/launch';
import { getOrFetchAllProducts } from '../ProductGrid';
import ShinyText from './index';

export function StorefrontNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const { items, setIsCartOpen } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const { trigger: navTransition } = usePageTransition();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dropdown states
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

  // Search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchIconRef = useRef<HTMLButtonElement>(null);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const [searchProducts, setSearchProducts] = useState<any[]>([]);

  // Launch config / Live mode
  const [isLiveMode, setIsLiveMode] = useState(() => {
    const now = Date.now();
    const start = COUNTDOWN_START_TIMESTAMP.getTime();
    const end = LAUNCH_CONFIG.brandLaunch.getTime();
    return isAdmin || now < start || now >= end;
  });

  useEffect(() => {
    if (isAdmin) setIsLiveMode(true);
  }, [isAdmin]);

  useEffect(() => {
    const checkLive = () => {
      const now = Date.now();
      const start = COUNTDOWN_START_TIMESTAMP.getTime();
      const end = LAUNCH_CONFIG.brandLaunch.getTime();
      const shouldBeLive = isAdmin || now < start || now >= end;
      setIsLiveMode((prev) => (prev !== shouldBeLive ? shouldBeLive : prev));
      return { now, end };
    };
    const { now, end } = checkLive();
    if (isAdmin || now >= end) return;
    const interval = setInterval(checkLive, 10000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Pre-fetch search products when search is opened
  useEffect(() => {
    if (isSearchOpen) {
      getOrFetchAllProducts()
        .then((products) => setSearchProducts(products))
        .catch((err) => console.error('Failed to pre-fetch search products:', err));
    }
  }, [isSearchOpen]);

  // Scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 50;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdowns
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
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        searchIconRef.current &&
        !searchIconRef.current.contains(event.target as Node)
      ) {
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

  // Auto-close search whenever the route changes
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery('');
  }, [pathname]);

  const openSearch = () => {
    setIsSearchOpen(true);
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
    navTransition(() => {
      setIsSearchOpen(false);
      setSearchQuery('');
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    });
  };

  const getDisplayName = () => {
    if (!user) return null;
    if (user.name) return user.name.split(' ')[0].toUpperCase();
    if (user.email) return user.email.split('@')[0].toUpperCase();
    return 'USER';
  };

  const displayName = getDisplayName();

  return (
    <>
      <nav className="fixed top-0 w-full z-40 flex flex-col">
        {/* Coupon Strip */}
        <div className="w-full bg-black text-white text-center py-[9px] text-[13px] tracking-[0.25em] uppercase font-semibold font-plex-mono select-none">
          USE <span className="text-[#daa520]">ZEV10</span> TO GET <span className="text-[#daa520]">10%</span> OFF
        </div>

        {/* Main Navbar */}
        <div
          className={`w-full transition-all duration-1000 ${
            isScrolled
              ? 'bg-[rgba(var(--theme-bg-rgb),0.95)] backdrop-blur-md pt-6 pb-3'
              : 'bg-transparent pt-10 pb-4'
          }`}
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex justify-between items-center">
            {/* Desktop Left: Category links */}
            <div className="hidden md:flex space-x-16 text-[12px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
              {isLiveMode && (
                <>
                  {/* Clothing */}
                  <div
                    className="relative"
                    ref={clothingDropdownRef}
                    onMouseEnter={() => setIsClothingOpen(true)}
                    onMouseLeave={() => setIsClothingOpen(false)}
                  >
                    <button className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700">
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
                            href="/men"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsClothingOpen(false);
                              navTransition(() => router.push('/men'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                          >
                            MEN
                          </Link>
                          <Link
                            href="/women"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsClothingOpen(false);
                              navTransition(() => router.push('/women'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                          >
                            WOMEN
                          </Link>
                          <Link
                            href="/customize"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsClothingOpen(false);
                              navTransition(() => router.push('/customize'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em] border-t border-[rgba(var(--theme-accent-rgb),0.1)] mt-1 pt-3"
                          >
                            CUSTOMIZE
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Jewellery */}
                  <div
                    className="relative"
                    ref={jewelleryDropdownRef}
                    onMouseEnter={() => setIsJewelleryOpen(true)}
                    onMouseLeave={() => setIsJewelleryOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setIsJewelleryOpen(false);
                        navTransition(() => router.push('/jewellery/men'));
                      }}
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
                            href="/jewellery/men"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsJewelleryOpen(false);
                              navTransition(() => router.push('/jewellery/men'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                          >
                            MEN
                          </Link>
                          <Link
                            href="/jewellery/women"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsJewelleryOpen(false);
                              navTransition(() => router.push('/jewellery/women'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                          >
                            WOMEN
                          </Link>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Accessories */}
                  <div
                    className="relative"
                    ref={accessoriesDropdownRef}
                    onMouseEnter={() => setIsAccessoriesOpen(true)}
                    onMouseLeave={() => setIsAccessoriesOpen(false)}
                  >
                    <button
                      onClick={() => {
                        setIsAccessoriesOpen(false);
                        navTransition(() => router.push('/accessories'));
                      }}
                      className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700"
                    >
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
                            href="/accessories/keychains"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsAccessoriesOpen(false);
                              navTransition(() => router.push('/accessories/keychains'));
                            }}
                            className="text-left px-6 py-2 hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.05)] transition-all duration-300 w-full tracking-[0.3em]"
                          >
                            KEYCHAINS
                          </Link>
                          <Link
                            href="/accessories/soft-toys"
                            onClick={(e) => {
                              e.preventDefault();
                              setIsAccessoriesOpen(false);
                              navTransition(() => router.push('/accessories/soft-toys'));
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

            {/* Logo in Center */}
            <motion.button
              onClick={() => navTransition(() => router.push('/'))}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2, delay: 0.2 }}
              className="text-xl md:text-3xl font-archivo font-bold tracking-[0.1em] absolute left-1/2 transform -translate-x-1/2 text-[var(--theme-text)] cursor-pointer"
              style={{ fontStretch: '125%' }}
            >
              ZEVRAE
            </motion.button>

            {/* Desktop Right: Actions */}
            <div className="hidden md:flex items-center space-x-16 text-[12px] uppercase tracking-[0.3em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.7)]">
              {isLiveMode ? (
                <>
                  {/* Search Icon */}
                  <button
                    ref={searchIconRef}
                    onClick={isSearchOpen ? closeSearch : openSearch}
                    aria-label="Search"
                    aria-expanded={isSearchOpen}
                    className="flex items-center text-[rgba(var(--theme-text-rgb),0.7)] hover:text-[var(--theme-text)] transition-colors duration-300"
                  >
                    <Search size={14} strokeWidth={1.25} />
                  </button>

                  {/* AI Wardrobe */}
                  {!isAdmin && (
                    <button
                      onClick={() => navTransition(() => router.push('/ai-wardrobe'))}
                      className="group relative pb-1 transition-colors duration-700"
                    >
                      <ShinyText
                        text="AI WARDROBE"
                        disabled={false}
                        speed={3}
                        className="tracking-[0.3em]"
                        color="var(--theme-accent)"
                        shineColor="#FFFFFF"
                      />
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                    </button>
                  )}

                  {/* Admin link if admin */}
                  {isAdmin && (
                    <button
                      onClick={() => navTransition(() => router.push('/admin'))}
                      className="group relative pb-1 text-[#daa520] hover:text-[#fff] transition-colors duration-700"
                    >
                      ADMIN
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#daa520] nav-underline" />
                    </button>
                  )}

                  {/* User Profile / Login */}
                  {user ? (
                    <div
                      className="relative"
                      ref={profileDropdownRef}
                      onMouseEnter={() => setIsProfileOpen(true)}
                      onMouseLeave={() => setIsProfileOpen(false)}
                    >
                      <button className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700 uppercase">
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
                                navTransition(() => router.push('/profile'));
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
                    <button
                      onClick={() => navTransition(() => setIsLoginModalOpen(true))}
                      className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700"
                    >
                      LOGIN
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                    </button>
                  )}

                  {/* Cart / Bag */}
                  <button
                    onClick={() => navTransition(() => router.push('/bag'))}
                    className="group relative pb-1 hover:text-[var(--theme-text)] transition-colors duration-700"
                  >
                    BAG({items.reduce((total, item) => total + item.quantity, 0)})
                    <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                  </button>
                </>
              ) : (
                <>
                  {user ? (
                    <button
                      onClick={() => logout()}
                      className="group relative pb-1 hover:text-[var(--theme-accent)] transition-colors duration-700"
                    >
                      LOGOUT
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="group relative pb-1 hover:text-[var(--theme-accent)] transition-colors duration-700"
                    >
                      ADMIN LOGIN
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[rgba(var(--theme-accent-rgb),0.4)] nav-underline" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Mobile Hamburger */}
            {isLiveMode ? (
              <button
                className="md:hidden z-40 relative text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu size={28} strokeWidth={1} />
              </button>
            ) : (
              <button
                onClick={() => (user ? logout() : setIsLoginModalOpen(true))}
                className="md:hidden z-40 relative text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300 text-[10px] tracking-[0.2em] font-plex-mono uppercase"
              >
                {user ? 'LOGOUT' : 'ADMIN LOGIN'}
              </button>
            )}
          </div>
        </div>

        {/* ── Search overlay ── */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              key="search-overlay"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
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

                      const suggestions = searchProducts.filter((p) => {
                        const nameLower = (p.name || '').toLowerCase();
                        const catLower = (p.rawCategory || p.gender || '').toLowerCase();
                        const subcatLower = (p.rawSubcategory || p.category || '').toLowerCase();

                        return queryWords.every(
                          (word) =>
                            nameLower.includes(word) ||
                            catLower.includes(word) ||
                            subcatLower.includes(word)
                        );
                      });

                      if (suggestions.length === 0) {
                        return (
                          <div className="text-[10px] tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] py-2 text-center">
                            NO MATCHING PRODUCTS
                          </div>
                        );
                      }

                      return suggestions.slice(0, 5).map((p) => {
                        const img =
                          p.image?.src ||
                          (typeof p.image === 'string' ? p.image : '') ||
                          p.frontImg ||
                          '';
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              navTransition(() => {
                                setIsSearchOpen(false);
                                setSearchQuery('');
                                router.push(`/product/${p.id}`);
                              });
                            }}
                            className="flex items-center justify-between p-2 hover:bg-[rgba(var(--theme-accent-rgb),0.05)] cursor-pointer transition-colors border border-transparent hover:border-[rgba(var(--theme-accent-rgb),0.1)] group"
                          >
                            <div className="flex items-center gap-3">
                              {img && (
                                <img
                                  src={img}
                                  alt={p.name}
                                  className="w-8 h-8 object-cover rounded-sm border border-[rgba(var(--theme-accent-rgb),0.2)]"
                                />
                              )}
                              <span className="text-[11px] tracking-[0.15em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.8)] group-hover:text-[var(--theme-accent)] transition-colors">
                                {p.name}
                              </span>
                            </div>
                            <span className="text-[10px] tracking-[0.2em] font-plex-mono text-[rgba(var(--theme-text-rgb),0.4)] uppercase">
                              {p.price ? `₹${p.price.toLocaleString('en-IN')}` : ''}
                            </span>
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

      {/* ── Mobile Menu Drawer ── */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 bg-[var(--theme-bg)] z-50 flex flex-col justify-center items-center space-y-6 md:hidden px-6 overflow-y-auto py-16"
          >
            <button
              className="absolute top-8 right-8 text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300"
              onClick={() => setIsMenuOpen(false)}
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
                navTransition(() => router.push(`/search?q=${encodeURIComponent(trimmed)}`));
              }}
              className="flex items-center gap-3 border-b border-[rgba(var(--theme-text-rgb),0.2)] pb-3 w-64"
            >
              <Search
                size={14}
                strokeWidth={1.25}
                className="text-[rgba(var(--theme-text-rgb),0.4)] flex-shrink-0"
              />
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
              {
                name: 'Clothing',
                href: '#',
                onClick: () => setIsMobileClothingOpen(!isMobileClothingOpen),
              },
              ...(isMobileClothingOpen
                ? [
                    {
                      name: '- Men',
                      href: '/men',
                      onClick: () => {
                        navTransition(() => router.push('/men'));
                        setIsMenuOpen(false);
                        setIsMobileClothingOpen(false);
                      },
                      isSubItem: true,
                    },
                    {
                      name: '- Women',
                      href: '/women',
                      onClick: () => {
                        navTransition(() => router.push('/women'));
                        setIsMenuOpen(false);
                        setIsMobileClothingOpen(false);
                      },
                      isSubItem: true,
                    },
                    {
                      name: '- Customize',
                      href: '/customize',
                      onClick: () => {
                        navTransition(() => router.push('/customize'));
                        setIsMenuOpen(false);
                        setIsMobileClothingOpen(false);
                      },
                      isSubItem: true,
                    },
                  ]
                : []),
              {
                name: 'Jewellery',
                href: '#',
                onClick: () => setIsMobileJewelleryOpen(!isMobileJewelleryOpen),
              },
              ...(isMobileJewelleryOpen
                ? [
                    {
                      name: '- Men',
                      href: '/jewellery/men',
                      onClick: () => {
                        navTransition(() => router.push('/jewellery/men'));
                        setIsMenuOpen(false);
                        setIsMobileJewelleryOpen(false);
                      },
                      isSubItem: true,
                    },
                    {
                      name: '- Women',
                      href: '/jewellery/women',
                      onClick: () => {
                        navTransition(() => router.push('/jewellery/women'));
                        setIsMenuOpen(false);
                        setIsMobileJewelleryOpen(false);
                      },
                      isSubItem: true,
                    },
                  ]
                : []),
              {
                name: 'Accessories',
                href: '#',
                onClick: () => setIsMobileAccessoriesOpen(!isMobileAccessoriesOpen),
              },
              ...(isMobileAccessoriesOpen
                ? [
                    {
                      name: '- Keychains',
                      href: '/accessories/keychains',
                      onClick: () => {
                        navTransition(() => router.push('/accessories/keychains'));
                        setIsMenuOpen(false);
                        setIsMobileAccessoriesOpen(false);
                      },
                      isSubItem: true,
                    },
                    {
                      name: '- Soft Toys',
                      href: '/accessories/soft-toys',
                      onClick: () => {
                        navTransition(() => router.push('/accessories/soft-toys'));
                        setIsMenuOpen(false);
                        setIsMobileAccessoriesOpen(false);
                      },
                      isSubItem: true,
                    },
                  ]
                : []),
              ...(isAdmin
                ? []
                : [
                    {
                      name: 'AI Wardrobe',
                      href: '/ai-wardrobe',
                      onClick: () => {
                        navTransition(() => router.push('/ai-wardrobe'));
                        setIsMenuOpen(false);
                      },
                    },
                  ]),
              ...(isAdmin
                ? [
                    {
                      name: 'Admin Panel',
                      href: '#',
                      onClick: () => {
                        navTransition(() => router.push('/admin'));
                        setIsMenuOpen(false);
                      },
                    },
                  ]
                : []),
              ...(user
                ? [
                    {
                      name: displayName || 'USER',
                      href: '#',
                      onClick: () => setIsMobileProfileOpen(!isMobileProfileOpen),
                    },
                    ...(isMobileProfileOpen
                      ? [
                          {
                            name: '- Profile',
                            href: '/profile',
                            onClick: () => {
                              navTransition(() => router.push('/profile'));
                              setIsMenuOpen(false);
                              setIsMobileProfileOpen(false);
                            },
                            isSubItem: true,
                          },
                          {
                            name: '- Logout',
                            href: '#',
                            onClick: () => {
                              logout();
                              setIsMenuOpen(false);
                              setIsMobileProfileOpen(false);
                            },
                            isSubItem: true,
                          },
                        ]
                      : []),
                  ]
                : [
                    {
                      name: 'Login',
                      href: '#',
                      onClick: () => {
                        navTransition(() => setIsLoginModalOpen(true));
                        setIsMenuOpen(false);
                      },
                    },
                  ]),
              {
                name: `Bag(${items.reduce((total, item) => total + item.quantity, 0)})`,
                href: '/bag',
                onClick: () => {
                  navTransition(() => router.push('/bag'));
                  setIsMenuOpen(false);
                },
              },
            ].map((item, i) => (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className={`text-3xl md:text-5xl font-plex-mono tracking-[0.2em] text-[var(--theme-text)] hover:text-[var(--theme-accent)] transition-colors duration-300 uppercase ${
                  item.isSubItem ? 'text-xl md:text-3xl my-2' : ''
                }`}
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
    </>
  );
}
