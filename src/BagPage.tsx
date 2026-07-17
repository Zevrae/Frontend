import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { supabase } from './supabaseClient';
import './BagPage.css';

// "YOUR BAG" split into individual characters; space kept as a real char
const BAG_CHARS = 'YOUR BAG'.split('');
// Sequential left-to-right stagger order
const BAG_CHAR_ORDER = BAG_CHARS.map((_, i) => i);

export default function BagPage() {
  const { items, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Page fade-up entrance
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 20);
    return () => clearTimeout(timer);
  }, []);

  // GSAP letter animation — mirrors the ZEVRAE hero exactly
  useEffect(() => {
    if (!headerRef.current) return;

    const letters = headerRef.current.querySelectorAll<HTMLElement>('.bag-heading-letter');
    if (!letters.length) return;

    // Start all letters hidden below their clip
    gsap.set(letters, { yPercent: 110 });

    const tl = gsap.timeline();

    // Slide each letter up with power4.out — 0.09s stagger between starts
    BAG_CHAR_ORDER.forEach((charIdx, seqIdx) => {
      tl.to(
        letters[charIdx],
        { yPercent: 0, duration: 0.9, ease: 'power4.out' },
        `${seqIdx * 0.09}`,
      );
    });

    // Divider expands left→right simultaneously with the letters
    if (dividerRef.current) {
      gsap.set(dividerRef.current, { scaleX: 0, transformOrigin: 'left center' });
      tl.to(
        dividerRef.current,
        { scaleX: 1, duration: 1.25, ease: 'power2.inOut' },
        0,
      );
    }

    return () => { tl.kill(); };
  }, []);

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
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

  const isEmpty = items.length === 0;

  return (
    <div
      className="bag-page"
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(28px)',
        transition: 'opacity 0.85s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.85s cubic-bezier(0.25, 0.1, 0.25, 1)',
      }}
    >
      {/* ── Hero Heading ── */}
      <header className="bag-header" ref={headerRef}>
        <h1 className="bag-heading" aria-label="YOUR BAG">
          {BAG_CHARS.map((char, i) => (
            <span
              key={i}
              className="bag-heading-clip"
              aria-hidden="true"
            >
              {/* The space needs to remain visible as a gap — render as non-breaking space */}
              <span className="bag-heading-letter">
                {char === ' ' ? '\u00A0' : char}
              </span>
            </span>
          ))}
        </h1>
        <div className="bag-heading-divider" ref={dividerRef} />
      </header>

      {/* ── Empty State ── */}
      {isEmpty ? (
        <div className="bag-empty">
          <p className="bag-empty-headline">Some choices disappoint</p>
          <p className="bag-empty-sub">Your's doesn't have to.</p>
          <button className="bag-empty-cta" onClick={() => navigate('/')}>
            Continue Shopping ↗
          </button>
        </div>
      ) : (
        <>
          {/* ── Item List ── */}
          <ul className="bag-items">
            {items.map((item) => (
              <li key={`${item.id}-${item.size}`} className="bag-item">
                {/* Left — Name + Price */}
                <div className="bag-item-info">
                  <span className="bag-item-name">{item.name}</span>
                  {item.size && item.size !== 'One Size' && (
                    <span className="bag-item-size">{item.size}</span>
                  )}
                  <span className="bag-item-price">{formatPrice(item.price)}</span>
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
          <div className="bag-footer">
            {/* Left — Subtotal */}
            <div className="bag-subtotal">
              <span className="bag-subtotal-label">Subtotal</span>
              <span className="bag-subtotal-amount">{formatPrice(cartTotal)}</span>
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
              CHECKOUT&nbsp;<span className="bag-checkout-arrow">↗</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
