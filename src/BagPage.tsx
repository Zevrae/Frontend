import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useAuth } from './hooks/UseAuth';
import { usePageTransition } from './features/PageTransitionContext';
import './BagPage.css';

// "YOUR BAG" — only the 7 letter chars (space rendered separately)
const BAG_CHARS = 'YOUR BAG'.split('');
// Hero-style scrambled stagger order for the 7 letters: Y=0,O=1,U=2,R=3,B=4,A=5,G=6
// Scrambled like ZEVRAE hero [3,0,5,1,4,2] — pick non-sequential visual order: R,Y,G,O,B,U,A
const BAG_CHAR_ORDER = [3, 0, 6, 1, 4, 2, 5]; // R,Y,G,O,B,U,A

export default function BagPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const { phase } = usePageTransition();
  const { token } = useAuth();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLUListElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const emptyWrapRef = useRef<HTMLDivElement>(null);
  const emptyHeadlineRef = useRef<HTMLParagraphElement>(null);
  const emptySubRef = useRef<HTMLParagraphElement>(null);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();
  const isEmpty = items.length === 0;

  // Reset animations if we navigate to the bag page again while already on it
  useEffect(() => {
    setMounted(false);
    revealStarted.current = false;
  }, [location.key]);

  // Page fade-up entrance.
  // If phase is "idle" there's no curtain covering us — this is a cold load
  // or a browser back/forward nav (which skips the curtain entirely) — so we
  // reveal almost immediately, same as before.
  // If a transition IS active, we mounted while still fully hidden behind the
  // gold curtain (navigation fires at the "holding" phase, before the curtain
  // has peeled back at all). Starting our timers right then means they burn
  // away unseen and we only catch the tail once the curtain clears. Instead,
  // wait for the curtain to actually broadcast that it's revealing the page.
  const revealStarted = useRef(false);
  useEffect(() => {
    if (revealStarted.current) return;

    if (phase === 'idle') {
      revealStarted.current = true;
      // Increased from 80ms to 150ms to ensure GSAP has the DOM ready on hard reload
      const timer = setTimeout(() => setMounted(true), 150);
      return () => {
        clearTimeout(timer);
        revealStarted.current = false;
      };
    }

    const handleReveal = () => {
      if (revealStarted.current) return;
      revealStarted.current = true;
      setMounted(true);
    };
    window.addEventListener('zevrae:page-reveal', handleReveal);
    return () => {
      window.removeEventListener('zevrae:page-reveal', handleReveal);
      revealStarted.current = false;
    };
  }, [phase]);

  // GSAP letter animation — only starts AFTER page fade-in has begun
  useEffect(() => {
    if (!mounted) return;  // Wait for page to become visible first
    if (!headerRef.current) return;

    const letters = headerRef.current.querySelectorAll<HTMLElement>('.bag-heading-letter');
    if (!letters.length) return;

    // Divider starts invisible — draws left→right simultaneously like hero gold line
    if (dividerRef.current) {
      gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' });
    }

    // GSAP takes ownership of the transform — syncs to yPercent:110 (same as CSS default)
    // then animates to 0 so letters slide into view
    gsap.set(letters, { yPercent: 110 });

    // Small delay after page fade begins, then scrambled stagger (like hero's delay: 0.2)
    const tl = gsap.timeline({ delay: 0.15 });

    // Slide each letter up — power4.out, 0.09s stagger, exactly matching hero
    BAG_CHAR_ORDER.forEach((charIdx, seqIdx) => {
      tl.to(
        letters[charIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`,
      );
    });

    // Gold divider draws left→right simultaneously with letters (like hero gold line)
    if (dividerRef.current) {
      tl.to(
        dividerRef.current,
        { scaleX: 1, duration: 1.25, ease: 'power2.inOut' },
        0,
      );
    }

    return () => { tl.kill(); };
  }, [mounted]);

  // Cascading reveal for item text, subtotal, and checkout CTA — starts right as
  // the heading letters finish sliding in, then runs top → bottom down the page.
  // Deliberately mirrors the heading effect above (same [mounted] dep, no extra
  // guard ref) — a hasAnimated-style guard here breaks under StrictMode's
  // mount→cleanup→mount dev cycle: the first pass sets the guard true and then
  // gets killed before its delay elapses, so the second (surviving) pass sees
  // the guard already flipped and bails, and the animation never actually plays.
  useEffect(() => {
    if (!mounted) return;
    if (!itemsRef.current && !footerRef.current) return;

    const rows = itemsRef.current
      ? Array.from(itemsRef.current.querySelectorAll<HTMLElement>('.bag-item'))
      : [];
    const footerMasks = footerRef.current
      ? Array.from(footerRef.current.querySelectorAll<HTMLElement>('.mask-reveal-inner'))
      : [];

    if (!rows.length && !footerMasks.length) return;

    // Heading timeline runs delay(0.15) + last letter start(0.54) + duration(0.9) ≈ 1.6s
    const tl = gsap.timeline({ delay: 1.5 });

    rows.forEach((row, i) => {
      const masks = row.querySelectorAll<HTMLElement>('.mask-reveal-inner');
      gsap.set(masks, { yPercent: 110 });

      const rowStart = i * 0.12;

      // Row itself fades + rises slightly
      tl.to(
        row,
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        rowStart,
      );
      // Its text masks slide up right on top of that, same stagger feel as heading
      tl.to(
        masks,
        { yPercent: 0, duration: 0.8, ease: 'power4.out', stagger: 0.05 },
        rowStart + 0.05,
      );
    });

    if (footerMasks.length) {
      gsap.set(footerMasks, { yPercent: 110 });
      const footerStart = rows.length * 0.12 + 0.15;
      tl.to(
        footerMasks,
        { yPercent: 0, duration: 0.9, ease: 'power4.out', stagger: 0.08 },
        footerStart,
      );
    }

    return () => { tl.kill(); };
  }, [mounted]); // intentionally NOT depending on items.length

  // GSAP animation for Empty State quote and button
  useEffect(() => {
    if (!mounted || !isEmpty || !emptyWrapRef.current) return;

    const headline = emptyHeadlineRef.current;
    const sub = emptySubRef.current;
    const cta = emptyWrapRef.current.querySelector('.bag-empty-cta');

    if (!headline || !sub || !cta) return;

    // Start them hidden below their clipping containers
    gsap.set([headline, sub, cta], { yPercent: 120 });

    // Timeline starts after the 'YOUR BAG' header animation finishes (which takes ~1.5s total)
    const tl = gsap.timeline({ delay: 1.2 });

    tl.to(headline, { yPercent: 0, duration: 0.9, ease: 'power4.out' })
      .to(sub, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, '-=0.7')
      .to(cta, { yPercent: 0, duration: 0.9, ease: 'power4.out' }, '-=0.7');

    return () => { tl.kill(); };
  }, [mounted, isEmpty]);

  // Empty-state text fit-to-width — the heading naturally fills most of the
  // line because its clamp() ceiling is huge (16rem). The quote lines below
  // it were capped much lower (5rem / 4.5rem), so they stall out well short
  // of the line instead of actually filling it. A fixed clamp() can't fix
  // this properly since the right font-size depends on the exact sentence
  // length — so instead we measure the rendered width and scale font-size to
  // hit a target fill ratio directly, the same way the reference design does.
  useEffect(() => {
    if (!isEmpty) return;

    const fitLine = (
      el: HTMLElement | null,
      containerWidth: number,
      fillRatio: number,
      min: number,
      max: number,
    ) => {
      if (!el) return;
      el.style.fontSize = ''; // reset to CSS default before measuring
      const naturalWidth = el.getBoundingClientRect().width;
      const currentSize = parseFloat(getComputedStyle(el).fontSize);
      if (!naturalWidth || !currentSize) return;
      const target = containerWidth * fillRatio;
      const next = Math.min(max, Math.max(min, currentSize * (target / naturalWidth)));
      el.style.fontSize = `${next}px`;
    };

    const runFit = () => {
      const containerWidth = emptyWrapRef.current?.clientWidth ?? window.innerWidth;
      fitLine(emptyHeadlineRef.current, containerWidth, 0.85, 22, 160);
      fitLine(emptySubRef.current, containerWidth, 0.85, 20, 150);
    };

    // Measure only once the real font has actually loaded — measuring against
    // a fallback font's metrics would throw the fit off, sometimes badly.
    if ('fonts' in document) {
      document.fonts.ready.then(runFit);
    } else {
      runFit();
    }

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(runFit, 100);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
    };
  }, [isEmpty]);

  const handleCheckout = () => {
    if (!token) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div
      className="bag-page"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
    >
      {/* ── Hero Heading ── */}
      <header className="bag-header" ref={headerRef}>
        <h1 className="bag-heading" aria-label="YOUR BAG">
          {BAG_CHARS.map((char, i) =>
            char === ' ' ? (
              // Real word gap — not animated, just provides the space between YOUR and BAG
              <span key={i} className="bag-heading-space" aria-hidden="true" />
            ) : (
              <span key={i} className="bag-heading-clip" aria-hidden="true">
                <span className="bag-heading-letter">{char}</span>
              </span>
            )
          )}
        </h1>
        <div className="bag-heading-divider" ref={dividerRef} />
      </header>

      {/* ── Empty State ── */}
      {isEmpty ? (
        <div className="bag-empty" ref={emptyWrapRef}>
          <div style={{ overflow: 'hidden' }}>
            <p className="bag-empty-headline" ref={emptyHeadlineRef} style={{ willChange: 'transform' }}>Some choices leaves</p>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p className="bag-empty-sub" ref={emptySubRef} style={{ willChange: 'transform' }}>The right one stays.</p>
          </div>
          <div style={{ overflow: 'hidden', marginTop: 'clamp(2rem, 5vh, 4rem)' }}>
            <button className="bag-empty-cta" onClick={() => navigate('/')} style={{ willChange: 'transform' }}>
              Continue Shopping ↗
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── Item List ── */}
          <ul className="bag-items" ref={itemsRef}>
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="bag-item">
                {/* Left — Name + Price */}
                <div className="bag-item-info">
                  <span className="bag-item-name mask-reveal-block">
                    <span className="mask-reveal-inner">{item.name}</span>
                  </span>
                  {item.size && item.size !== 'One Size' && (
                    <span className="bag-item-size mask-reveal">
                      <span className="mask-reveal-inner">{item.size}</span>
                    </span>
                  )}
                  <span className="bag-item-price mask-reveal">
                    <span className="mask-reveal-inner">{formatPrice(item.price)}</span>
                  </span>
                </div>

                {/* Center — Product image */}
                <div className="bag-item-image-wrap">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="bag-item-image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="bag-item-image-placeholder" />
                  )}
                </div>

                {/* Right — Remove + Quantity */}
                <div className="bag-item-controls">
                  <button
                    className="bag-item-remove"
                    onClick={() => removeFromCart(item.id, item.size)}
                    aria-label={`Remove ${item.name}`}
                  >
                    Delete
                  </button>
                  <div className="bag-qty">
                    <button
                      className="bag-qty-btn"
                      onClick={() => updateQuantity(item.id, item.size, -1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className="bag-qty-value">{item.quantity}</span>
                    <button
                      className="bag-qty-btn"
                      onClick={() => updateQuantity(item.id, item.size, 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Thin divider below item */}
                <div className="bag-item-divider" />
              </li>
            ))}
          </ul>

          {/* ── Checkout Section ── */}
          <div className="bag-footer" ref={footerRef}>
            {/* Left — Subtotal */}
            <div className="bag-subtotal">
              <span className="bag-subtotal-label mask-reveal">
                <span className="mask-reveal-inner">Subtotal</span>
              </span>
              <span className="bag-subtotal-amount mask-reveal-block">
                <span className="mask-reveal-inner">{formatPrice(cartTotal)}</span>
              </span>
              <p className="bag-subtotal-note">
                Taxes and shipping will be calculated at checkout.
              </p>
            </div>

            {/* Right — Oversized checkout CTA */}
            <button
              className="bag-checkout-cta"
              onClick={handleCheckout}
              aria-label="Proceed to checkout"
            >
              <span className="mask-reveal-block">
                <span className="mask-reveal-inner">CHECKOUT&nbsp;<span className="bag-checkout-arrow">↗</span></span>
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}