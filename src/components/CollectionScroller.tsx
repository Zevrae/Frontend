import { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../features/PageTransitionContext';

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────────────────
   Data
   ───────────────────────────────────────────────────────── */
interface Collection {
  id: string;
  number: string;
  label: string;
  heading: string;
  sub: string;
  route: string;
  bgColor: string;
  image: string;
  isContain?: boolean;
  itemCount: number;
}

const collections: Collection[] = [
  {
    id: 'men',
    number: '01',
    label: 'MEN',
    heading: 'The Collection',
    sub: 'Refined tailoring and elevated essentials for the modern man.',
    route: '/men',
    bgColor: '#0e0e0e',
    image: 'https://i.ibb.co/k6VLyf0x/CARNAGE-FRONT.png',
    itemCount: 14,
  },
  {
    id: 'women',
    number: '02',
    label: 'WOMEN',
    heading: 'The Silhouette',
    sub: 'Curated pieces for the modern silhouette. Bold, fluid, expressive.',
    route: '/women',
    bgColor: '#0c0c10',
    image: 'https://i.ibb.co/21qqDjDv/LIGHTNING-MCQUEEN-BLACK.png',
    itemCount: 4,
  },
  {
    id: 'jewellery',
    number: '03',
    label: 'JEWELLERY',
    heading: 'The Details',
    sub: 'Wearable art. Each piece crafted to be a statement of identity.',
    route: '/jewellery',
    bgColor: '#0a0a0d',
    image: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    isContain: true,
    itemCount: 20,
  },
  {
    id: 'footwear',
    number: '04',
    label: 'FOOTWEAR',
    heading: 'The Foundation',
    sub: 'Ground yourself in luxury. Every step, considered.',
    route: '/men',
    bgColor: '#0b0b0b',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800',
    itemCount: 3,
  },
];

/* ─────────────────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────────────────── */
export function CollectionScroller() {
  const wrapperRef = useRef<HTMLDivElement>(null);   // outer scrollable height
  const stickyRef = useRef<HTMLDivElement>(null);    // pinned viewport
  const trackRef  = useRef<HTMLDivElement>(null);    // horizontal track
  const [activeIdx, setActiveIdx] = useState(0);

  const navigate = useNavigate();
  const { trigger: navTransition } = usePageTransition();

  /* ── GSAP Horizontal ScrollTrigger ─────────────────── */
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const sticky  = stickyRef.current;
    const track   = trackRef.current;
    if (!wrapper || !sticky || !track) return;

    const cards = gsap.utils.toArray<HTMLElement>('.cs-card');
    const count  = cards.length;

    // Total horizontal distance to travel
    const getScrollWidth = () => track.scrollWidth - window.innerWidth;

    let ctx = gsap.context(() => {
      // Horizontal scrub tween
      const tween = gsap.to(track, {
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
            // which card is closest to center?
            const progress = self.progress;
            const idx = Math.round(progress * (count - 1));
            setActiveIdx(Math.min(Math.max(idx, 0), count - 1));
          },
        },
      });
    }, wrapper);

    return () => ctx.revert();
  }, []);

  /* ── Jump to card on dot click ─────────────────────── */
  const scrollToCard = (idx: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const track = trackRef.current;
    if (!track) return;
    const totalH = track.scrollWidth - window.innerWidth + window.innerHeight;
    const progress = idx / (collections.length - 1);
    const top = wrapper.offsetTop + progress * (totalH - window.innerHeight);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    /* Outer: gives scroll height */
    <div
      ref={wrapperRef}
      id="collection"
      className="cs-wrapper"
    >
      {/* Pinned viewport */}
      <div ref={stickyRef} className="cs-sticky">

        {/* Section header — always visible */}
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

        {/* Horizontal track */}
        <div className="cs-track-outer">
          <div ref={trackRef} className="cs-track">
            {collections.map((col, i) => {
              const isActive = i === activeIdx;
              const dist = Math.abs(i - activeIdx);
              return (
                <div
                  key={col.id}
                  className={`cs-card ${isActive ? 'cs-card--active' : ''} cs-card--dist-${Math.min(dist, 3)}`}
                  style={{ '--bg': col.bgColor } as React.CSSProperties}
                  onClick={() => {
                    if (isActive) navTransition(() => navigate(col.route));
                    else scrollToCard(i);
                  }}
                >
                  {/* Number tag */}
                  <span className="cs-card__number">{col.number}</span>

                  {/* Image */}
                  <div className={`cs-card__img-wrap ${col.isContain ? 'cs-card__img-wrap--contain' : ''}`}>
                    <img
                      src={col.image}
                      alt={col.label}
                      className="cs-card__img"
                      loading="lazy"
                      draggable={false}
                    />
                  </div>

                  {/* Text */}
                  <div className="cs-card__body">
                    <p className="cs-card__label">{col.label}</p>
                    <h2 className="cs-card__heading">{col.heading}</h2>
                    <p className="cs-card__sub">{col.sub}</p>
                    <div className="cs-card__meta">
                      <span className="cs-card__count">{col.itemCount} pieces</span>
                      <button
                        className="cs-card__cta"
                        onClick={(e) => {
                          e.stopPropagation();
                          navTransition(() => navigate(col.route));
                        }}
                      >
                        <span>Explore</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom scroll hint */}
        <div className="cs-scroll-hint">
          <span className="cs-scroll-hint__line" />
          <span className="cs-scroll-hint__text">SCROLL</span>
          <span className="cs-scroll-hint__line" />
        </div>
      </div>
    </div>
  );
}
