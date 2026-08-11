import { useRef, useState, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../features/PageTransitionContext';
import { useSetTheme } from '../theme/ThemeProvider';
import type { ThemeName } from '../theme/themeConfig';
import clothingDefault from '../assets/static/image1.jpg';
import menClothing from '../assets/static/zoom.jpg';
import womenClothing from '../assets/static/front.jpeg';
import jewelleryCover from '../assets/jewellery cover page .jpeg';
import jewelleryMen from '../assets/men jewellery.png';
import jewelleryWomen from '../assets/women jewellery.jpeg';


/* ---------------------------------------------------------
   Data
   --------------------------------------------------------- */
interface Collection {
  id: string;
  number: string;
  label: string;
  heading: string;
  sub: string;
  menRoute: string;
  womenRoute: string;
  image: string;
  menImage: string;
  womenImage: string;
  isContain?: boolean;
}

const collections: Collection[] = [
  {
    id: 'clothing',
    number: '01',
    label: 'CLOTHING',
    heading: 'Clothing',
    sub: 'Refined tailoring and elevated essentials — crafted for those who wear intention.',
    menRoute: '/men',
    womenRoute: '/women',
    image: clothingDefault,
    menImage: menClothing,
    womenImage: womenClothing,
  },
  {
    id: 'jewellery',
    number: '02',
    label: 'JEWELLERY',
    heading: 'Jewellery',
    sub: 'Handcrafted with precision and care. Each piece tells a story of dedication and artistry.',
    menRoute: '/jewellery/men',
    womenRoute: '/jewellery/women',
    image: jewelleryCover,
    menImage: jewelleryMen,
    womenImage: jewelleryWomen,
  },
  {
    id: 'accessories',
    number: '03',
    label: 'ACCESSORIES',
    heading: 'Accessories',
    sub: 'Each piece is crafted to be a statement of identity. Details that define the silhouette.',
    menRoute: '/accessories',
    womenRoute: '/accessories',
    image: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    menImage: 'https://i.ibb.co/k6VLyf0x/CARNAGE-FRONT.png',
    womenImage: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    isContain: true,
  },
];

/* ---------------------------------------------------------
   CollectionCard
   --------------------------------------------------------- */
interface CardProps {
  col: Collection;
  isActive: boolean;
  dist: number;
  onClickInactive: () => void;
}

function CollectionCard({ col, isActive, dist, onClickInactive }: CardProps) {
  const navigate = useNavigate();
  const { trigger: navTransition } = usePageTransition();
  const [hovered, setHovered] = useState<'men' | 'women' | null>(null);

  return (
    <div
      className={`cs-card ${isActive ? 'cs-card--active' : ''} cs-card--dist-${Math.min(dist, 3)}`}
      onClick={() => { if (!isActive) onClickInactive(); }}
    >
      <span className="cs-card__number">{col.number}</span>

      <div className={`cs-card__img-wrap ${col.isContain ? 'cs-card__img-wrap--contain' : ''}`}>
        <img
          src={col.image}
          alt={col.label}
          className={`cs-card__img cs-card__img--default ${hovered === null ? 'cs-card__img--visible' : ''}`}
          loading="lazy"
          draggable={false}
        />
        <img
          src={col.menImage}
          alt={`${col.label} Men`}
          className={`cs-card__img cs-card__img--men ${hovered === 'men' ? 'cs-card__img--visible' : ''}`}
          loading="lazy"
          draggable={false}
        />
        <img
          src={col.womenImage}
          alt={`${col.label} Women`}
          className={`cs-card__img cs-card__img--women ${hovered === 'women' ? 'cs-card__img--visible' : ''}`}
          loading="lazy"
          draggable={false}
        />
      </div>

      <div className="cs-card__body">
        <p className="cs-card__label">{col.label}</p>
        <h2 className="cs-card__heading">{col.heading}</h2>
        <p className="cs-card__sub">{col.sub}</p>
        <div className="cs-card__actions">
          {col.id !== 'accessories' ? (
            <>
              <button
                className="cs-card__cta cs-card__cta--men"
                onMouseEnter={() => setHovered('men')}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => { e.stopPropagation(); navTransition(() => navigate(col.menRoute)); }}
              >
                <span>Men</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
              <button
                className="cs-card__cta cs-card__cta--women"
                onMouseEnter={() => setHovered('women')}
                onMouseLeave={() => setHovered(null)}
                onClick={(e) => { e.stopPropagation(); navTransition(() => navigate(col.womenRoute)); }}
              >
                <span>Women</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </>
          ) : (
            <button
              className="cs-card__cta"
              onClick={(e) => { e.stopPropagation(); navTransition(() => navigate('/accessories')); }}
            >
              <span>Explore</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main Component
   --------------------------------------------------------- */
export function CollectionScroller() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const setTheme = useSetTheme();
  const isAnimating = useRef(false);

  // Swipe gesture refs
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    setTheme(collections[activeIdx].id as ThemeName);
  }, [activeIdx, setTheme]);

  const goTo = useCallback((idx: number) => {
    if (isAnimating.current) return;
    const clamped = Math.max(0, Math.min(idx, collections.length - 1));
    if (clamped === activeIdx) return;

    isAnimating.current = true;
    setActiveIdx(clamped);

    const track = trackRef.current;
    if (track) {
      const cards = track.querySelectorAll<HTMLElement>('.cs-card');
      const card = cards[clamped];
      if (card) {
        const cardRect   = card.getBoundingClientRect();
        const currentX   = gsap.getProperty(track, 'x') as number;
        const cardCenter = cardRect.left + cardRect.width / 2;
        const viewCenter = window.innerWidth / 2;
        const targetX    = currentX + (viewCenter - cardCenter);

        gsap.to(track, {
          x: targetX,
          duration: 0.75,
          ease: 'power3.inOut',
          onComplete: () => { isAnimating.current = false; },
        });
      } else {
        isAnimating.current = false;
      }
    } else {
      isAnimating.current = false;
    }
  }, [activeIdx]);

  // Set initial track position on mount so first card is centered
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>('.cs-card');
    const card = cards[0];
    if (!card) return;
    const cardRect   = card.getBoundingClientRect();
    const currentX   = gsap.getProperty(track, 'x') as number || 0;
    const cardCenter = cardRect.left + cardRect.width / 2;
    const viewCenter = window.innerWidth / 2;
    const targetX    = currentX + (viewCenter - cardCenter);
    gsap.set(track, { x: targetX });
  }, []);

  const goPrev = () => goTo(activeIdx - 1);
  const goNext = () => goTo(activeIdx + 1);

  const canPrev = activeIdx > 0;
  const canNext = activeIdx < collections.length - 1;

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    const swipeThreshold = 50; // minimum pixels to be considered a swipe

    if (diff > swipeThreshold && canNext) {
      goNext();
    } else if (diff < -swipeThreshold && canPrev) {
      goPrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div id="collection" className="cs-wrapper">
      <div className="cs-sticky">

        <div className="cs-header">
          <p className="cs-header__eyebrow">COLLECTIONS</p>
          <div className="cs-header__dots">
            {collections.map((col, i) => (
              <button
                key={col.id}
                onClick={() => goTo(i)}
                className={`cs-dot ${i === activeIdx ? 'cs-dot--active' : ''}`}
                aria-label={`Go to ${col.label}`}
              >
                <span className="cs-dot__bar" />
                <span className="cs-dot__label">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Arrow controls — sit between header and cards */}
        <div className="cs-arrows">
          <button
            className={`cs-arrow cs-arrow--prev ${!canPrev ? 'cs-arrow--disabled' : ''}`}
            onClick={goPrev}
            disabled={!canPrev}
            aria-label="Previous collection"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="cs-arrows__counter">
            {String(activeIdx + 1).padStart(2, '0')} / {String(collections.length).padStart(2, '0')}
          </span>

          <button
            className={`cs-arrow cs-arrow--next ${!canNext ? 'cs-arrow--disabled' : ''}`}
            onClick={goNext}
            disabled={!canNext}
            aria-label="Next collection"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div 
          className="cs-track-outer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div ref={trackRef} className="cs-track">
            {collections.map((col, i) => (
              <CollectionCard
                key={col.id}
                col={col}
                isActive={i === activeIdx}
                dist={Math.abs(i - activeIdx)}
                onClickInactive={() => goTo(i)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
