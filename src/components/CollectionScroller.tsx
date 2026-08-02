import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../features/PageTransitionContext';
import clothingDefault from '../assets/static/image1.jpg';
import menClothing from '../assets/static/zoom.jpg';
import womenClothing from '../assets/static/front.jpeg';
import jewelHome from '../assets/static/jewelHome.png';
import jewelleryMen from '../assets/static/jewelMen.png';
import jewelleryWomen from '../assets/static/jewelWomen.png';


gsap.registerPlugin(ScrollTrigger);

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
  bgColor: string;
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
    bgColor: '#0e0e0e',
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
    menRoute: '/jewellery',
    womenRoute: '/jewellery',
    bgColor: '#0c0c10',
    image: jewelHome,
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
    bgColor: '#0a0a0d',
    image: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    menImage: 'https://i.ibb.co/k6VLyf0x/CARNAGE-FRONT.png',
    womenImage: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    isContain: true,
  },
];

/* ---------------------------------------------------------
   CollectionCard — owns per-card hover state
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
      style={{ '--bg': col.bgColor } as React.CSSProperties}
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const stickyRef  = useRef<HTMLDivElement>(null);
  const trackRef   = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky  = stickyRef.current;
    const track   = trackRef.current;
    if (!wrapper || !sticky || !track) return;

    const cards = gsap.utils.toArray<HTMLElement>('.cs-card');
    const count  = cards.length;
    const getScrollWidth = () => track.scrollWidth - window.innerWidth;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -getScrollWidth(),
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: () => `+=${getScrollWidth() + window.innerHeight}`,
          scrub: 1,
          pin: sticky,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const idx = Math.round(self.progress * (count - 1));
            setActiveIdx(Math.min(Math.max(idx, 0), count - 1));
          },
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  const scrollToCard = (idx: number) => {
    const wrapper = wrapperRef.current;
    const track   = trackRef.current;
    if (!wrapper || !track) return;
    const totalH   = track.scrollWidth - window.innerWidth + window.innerHeight;
    const progress = idx / (collections.length - 1);
    const top      = wrapper.offsetTop + progress * (totalH - window.innerHeight);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div ref={wrapperRef} id="collection" className="cs-wrapper">
      <div ref={stickyRef} className="cs-sticky">
        <div className="cs-header">
          <p className="cs-header__eyebrow">COLLECTIONS</p>
          <div className="cs-header__dots">
            {collections.map((col, i) => (
              <button
                key={col.id}
                onClick={() => scrollToCard(i)}
                className={`cs-dot ${i === activeIdx ? 'cs-dot--active' : ''}`}
                aria-label={`Go to ${col.label}`}
              >
                <span className="cs-dot__bar" />
                <span className="cs-dot__label">{col.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="cs-track-outer">
          <div ref={trackRef} className="cs-track">
            {collections.map((col, i) => (
              <CollectionCard
                key={col.id}
                col={col}
                isActive={i === activeIdx}
                dist={Math.abs(i - activeIdx)}
                onClickInactive={() => scrollToCard(i)}
              />
            ))}
          </div>
        </div>

        <div className="cs-scroll-hint">
          <span className="cs-scroll-hint__line" />
          <span className="cs-scroll-hint__text">SCROLL</span>
          <span className="cs-scroll-hint__line" />
        </div>
      </div>
    </div>
  );
}
