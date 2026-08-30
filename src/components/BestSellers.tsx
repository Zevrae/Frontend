/**
 * BestSellers
 *
 * A dynamic, editorial Best Sellers showcase that reacts to the currently
 * active COLLECTIONS tab (CLOTHING / JEWELLERY / ACCESSORIES).
 *
 * Architecture:
 * ─────────────
 * - Reads `activeCollectionId` from ActiveCollectionContext (written by
 *   CollectionScroller when the user changes category tabs).
 * - Resolves best-seller products by name-matching against the shared
 *   product cache (same data ProductGrid uses — zero duplication).
 * - Implements a simple carousel: visibleCount products per page
 *   (3 desktop / 2 tablet / 1 mobile), arrow navigation, dynamic pagination.
 * - Animates the product grid on category switch: fade+slide out, then in.
 * - All theme inheritance comes from CSS custom properties — no separate
 *   theme logic is introduced here.
 *
 * What this does NOT do:
 * ─────────────────────
 * - No Add to Cart / Buy Now buttons
 * - No rating stars / hearts / extra badges
 * - No new product images — uses only images[0] from the existing product
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useActiveCollection } from '../features/ActiveCollectionContext';
import { getOrFetchAllProducts, getCachedProducts } from '../ProductGrid';
import { BEST_SELLER_NAMES, type CollectionKey } from '../data/bestSellers';
import type { ThemeName } from '../theme/themeConfig';
import './BestSellers.css';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/** Format a price integer (stored as smallest unit) to a display string.
 *  e.g. 1999 → "₹1,999" */
function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

/** Build a human-readable category label for display under the product name.
 *  e.g. gender="men", rawCategory="Men", rawSubcategory="T-shirts"
 *  → "MEN / T-SHIRTS"
 */
function buildCategoryLabel(product: any): string {
  const raw = product.rawCategory || product.category || '';
  const sub = product.rawSubcategory || product.type || '';

  // Jewellery / Accessories: show top-level + subcategory
  if (raw.toLowerCase().startsWith('jewellery')) {
    const gender = raw.toLowerCase().includes('men') ? 'MEN' : 'WOMEN';
    return sub ? `JEWELLERY / ${sub.toUpperCase()}` : `JEWELLERY — ${gender}`;
  }
  if (raw.toLowerCase() === 'accessories') {
    return sub ? `ACCESSORIES / ${sub.toUpperCase()}` : 'ACCESSORIES';
  }
  // Clothing
  const genderLabel = product.gender === 'women' ? 'WOMEN' : 'MEN';
  return sub ? `${genderLabel} / ${sub.toUpperCase()}` : genderLabel;
}

/**
 * Resolve best-seller products for a given collection from the cached product
 * pool. Products are matched by case-insensitive name substring. The order of
 * BEST_SELLER_NAMES is preserved. Duplicates are skipped.
 */
function resolveBestSellers(
  collection: ThemeName,
  allProducts: any[],
): any[] {
  const nameFragments = BEST_SELLER_NAMES[collection as CollectionKey] ?? [];
  const seen = new Set<string>();
  const result: any[] = [];

  for (const fragment of nameFragments) {
    const lower = fragment.toLowerCase();
    const match = allProducts.find(
      (p) => !seen.has(p.id) && p.name?.toLowerCase().includes(lower),
    );
    if (match) {
      seen.add(match.id);
      result.push(match);
    }
  }

  return result;
}

/** Returns number of products visible per carousel page based on viewport. */
function getVisibleCount(): number {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export function BestSellers() {
  const { activeCollectionId } = useActiveCollection();

  // ── Product data ────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<any[]>(getCachedProducts() ?? []);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(!getCachedProducts());

  useEffect(() => {
    // If cache is already populated (ProductGrid loaded first), use it instantly.
    const cached = getCachedProducts();
    if (cached) {
      setAllProducts(cached);
      setIsDataLoading(false);
      return;
    }
    // Otherwise fetch — will also populate the shared cache for ProductGrid.
    setIsDataLoading(true);
    getOrFetchAllProducts()
      .then((products) => {
        setAllProducts(products);
      })
      .catch((err) => {
        console.error('[BestSellers] Failed to load products', err);
      })
      .finally(() => {
        setIsDataLoading(false);
      });
  }, []);

  // ── Derived best sellers for the active collection ──────────────────────────
  const bestSellers = resolveBestSellers(activeCollectionId, allProducts);

  // ── Carousel state ──────────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(getVisibleCount);
  const [currentPage, setCurrentPage] = useState(0);

  // Track visible count on resize
  useEffect(() => {
    const onResize = () => setVisibleCount(getVisibleCount());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(bestSellers.length / visibleCount));
  const clampedPage = Math.min(currentPage, totalPages - 1);

  const visibleProducts = bestSellers.slice(
    clampedPage * visibleCount,
    clampedPage * visibleCount + visibleCount,
  );

  // ── Category-switch animation ───────────────────────────────────────────────
  // When activeCollectionId changes:
  //   1. Mark the grid as "exiting" → CSS animates fade+slide out (320ms)
  //   2. After exit completes, update the displayed collection + reset page
  //   3. Mark as "entering" → CSS animates fade+slide in (420ms)

  const [displayedCollection, setDisplayedCollection] = useState<ThemeName>(activeCollectionId);
  const [displayedPage, setDisplayedPage] = useState(0);
  const [animState, setAnimState] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The products that are *currently on screen* (may lag behind activeCollectionId during exit)
  const displayedBestSellers = resolveBestSellers(displayedCollection, allProducts);
  const displayedTotalPages = Math.max(1, Math.ceil(displayedBestSellers.length / visibleCount));
  const displayedClampedPage = Math.min(displayedPage, displayedTotalPages - 1);
  const displayedVisible = displayedBestSellers.slice(
    displayedClampedPage * visibleCount,
    displayedClampedPage * visibleCount + visibleCount,
  );

  useEffect(() => {
    if (activeCollectionId === displayedCollection) return;

    // Clear any pending timer from a rapid switch
    if (animTimerRef.current) clearTimeout(animTimerRef.current);

    // Phase 1: exit
    setAnimState('exiting');

    animTimerRef.current = setTimeout(() => {
      // Phase 2: swap content
      setDisplayedCollection(activeCollectionId);
      setDisplayedPage(0);
      setCurrentPage(0);
      setAnimState('entering');

      // Phase 3: mark idle after enter completes
      animTimerRef.current = setTimeout(() => {
        setAnimState('idle');
        animTimerRef.current = null;
      }, 450);
    }, 340);

    return () => {
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [activeCollectionId]);

  // ── Carousel navigation ─────────────────────────────────────────────────────
  // Uses displayedCollection/displayedPage so arrows always act on what's
  // visible even if a category transition is mid-flight.

  const canPrev = displayedClampedPage > 0;
  const canNext = displayedClampedPage < displayedTotalPages - 1;

  const goPrev = useCallback(() => {
    if (!canPrev || animState === 'exiting') return;
    setDisplayedPage((p) => Math.max(0, p - 1));
    setCurrentPage((p) => Math.max(0, p - 1));
  }, [canPrev, animState]);

  const goNext = useCallback(() => {
    if (!canNext || animState === 'exiting') return;
    setDisplayedPage((p) => Math.min(displayedTotalPages - 1, p + 1));
    setCurrentPage((p) => Math.min(displayedTotalPages - 1, p + 1));
  }, [canNext, displayedTotalPages, animState]);

  // ── Render ──────────────────────────────────────────────────────────────────

  const slideWrapperClass = [
    'bs-slide-wrapper',
    animState === 'exiting' ? 'bs-exiting' : '',
    animState === 'entering' ? 'bs-entering' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className="bs-section">
      <div className="bs-inner">

        {/* ── Top row: heading left, arrows right ── */}
        <div className="bs-toprow">
          <div>
            <p className="bs-eyebrow">
              {displayedCollection.toUpperCase()} COLLECTION
            </p>
            <h2 className="bs-heading">BEST SELLERS</h2>
          </div>

          {/* Only render controls when there's more than one page */}
          {displayedTotalPages > 1 && (
            <div className="bs-controls" role="group" aria-label="Best sellers navigation">
              <button
                className="bs-arrow bs-arrow--prev"
                onClick={goPrev}
                disabled={!canPrev}
                aria-label="Previous best sellers"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              <span className="bs-counter" aria-live="polite">
                {String(displayedClampedPage + 1).padStart(2, '0')}{' '}
                /{' '}
                {String(displayedTotalPages).padStart(2, '0')}
              </span>

              <button
                className="bs-arrow bs-arrow--next"
                onClick={goNext}
                disabled={!canNext}
                aria-label="Next best sellers"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* ── Product grid ── */}
        <div className="bs-viewport">
          <div className={slideWrapperClass}>

            {isDataLoading ? (
              /* Loading spinner */
              <div className="bs-empty">
                <div className="bs-spinner" aria-label="Loading best sellers" />
              </div>

            ) : displayedVisible.length === 0 ? (
              /* Empty state */
              <div className="bs-empty">
                <p className="bs-empty__text">New Collection Coming Soon</p>
              </div>

            ) : (
              /* Products */
              <div className="bs-grid">
                {displayedVisible.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    state={{ product }}
                    className="bs-product"
                    aria-label={`View ${product.name}`}
                  >
                    {/* Image — primary image only, no gallery */}
                    <div className="bs-product__img-wrap" data-cursor-image>
                      <img
                        src={product.frontImg}
                        alt={product.name}
                        className="bs-product__img"
                        loading="lazy"
                        draggable={false}
                      />
                      {/* Discount badge — only if product has one */}
                      {product.discount && (
                        <span className="bs-product__badge">
                          -{product.discount}%
                        </span>
                      )}
                    </div>

                    {/* Product info — typography small, editorial */}
                    <div className="bs-product__info">
                      <p className="bs-product__cat">
                        {buildCategoryLabel(product)}
                      </p>
                      <p className="bs-product__name">{product.name}</p>
                      <p className="bs-product__price">
                        {formatPrice(product.price)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </section>
  );
}
