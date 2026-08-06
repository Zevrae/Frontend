import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Award,
  RotateCcw,
  ShieldCheck,
  Users,
  Headphones,
  Truck,
  Lock,
} from 'lucide-react';
import { usePageTransition } from '../features/PageTransitionContext';

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface NavLink {
  label: string;
  to: string;
  external?: boolean;
}

/* ─────────────────────────────────────────────
   Data
───────────────────────────────────────────── */
const SHOP_LINKS: NavLink[] = [
  { label: 'New In', to: '/' },
  { label: 'Best Sellers', to: '/' },
  { label: 'Clothing', to: '/men' },
  { label: 'Accessories', to: '/accessories' },
  { label: 'Collections', to: '/women' },
  { label: 'Gift Cards', to: '/' },
];

const CARE_LINKS: NavLink[] = [
  { label: 'Contact Us', to: '/customer-care' },
  { label: 'Shipping', to: '/shipping-returns' },
  { label: 'Returns & Exchanges', to: '/shipping-returns' },
  { label: 'Size Guide', to: '/size-guide' },
  { label: 'Track Your Order', to: '/customer-care' },
  { label: 'FAQ', to: '/customer-care' },
];

const LEGAL_LINKS: NavLink[] = [
  { label: 'Privacy Policy', to: '/privacy-policy' },
  { label: 'Terms & Conditions', to: '/terms-of-service' },
  { label: 'Cookie Policy', to: '/privacy-policy' },
  { label: 'Disclaimer', to: '/terms-of-service' },
];

const FEATURE_CARDS = [
  {
    icon: Award,
    title: 'PREMIUM QUALITY',
    desc: 'Finest materials, always.',
  },
  {
    icon: RotateCcw,
    title: 'EASY RETURNS',
    desc: '30-day hassle-free returns.',
  },
  {
    icon: Lock,
    title: 'SECURE CHECKOUT',
    desc: 'Your data is 100% protected.',
  },
  {
    icon: Users,
    title: 'TRUSTED BY 10K+',
    desc: 'Customers love our products.',
  },
];

/* Payment provider icon SVGs — inline for zero extra deps */
const PaymentIcons = () => (
  <div className="zf-payments">
    {/* Visa */}
    <span className="zf-pay-chip" title="Visa">
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="zf-pay-svg">
        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
        <path d="M20 22H17L19 10H22L20 22Z" fill="white"/>
        <path d="M29 10.3C28.3 10.1 27.3 10 26.1 10C23.1 10 21 11.5 21 13.6C21 15.2 22.5 16.1 23.6 16.6C24.8 17.2 25.2 17.6 25.2 18.1C25.2 18.9 24.2 19.3 23.3 19.3C22 19.3 21.3 19.1 20.3 18.7L19.9 18.5L19.5 21.3C20.3 21.7 21.7 22 23.2 22C26.4 22 28.5 20.6 28.5 18.3C28.5 17 27.6 16 25.9 15.2C24.8 14.7 24.2 14.3 24.2 13.8C24.2 13.3 24.8 12.8 26.1 12.8C27.2 12.8 28 13 28.6 13.3L28.9 13.4L29 10.3Z" fill="white"/>
        <path d="M33.5 10H31.2C30.5 10 30 10.2 29.7 10.9L25 22H28.2L28.8 20.4H32.6L32.9 22H35.5L33.5 10ZM29.7 18.3L31 14.7L31.8 18.3H29.7Z" fill="white"/>
        <path d="M17.5 10L14.5 18.6L14.2 17.2C13.6 15.4 11.9 13.4 10 12.4L12.8 22H16L20.8 10H17.5Z" fill="white"/>
        <path d="M12 10H7L7 10.2C10.9 11.2 13.5 13.5 14.2 17.2L13.4 11C13.2 10.3 12.7 10 12 10Z" fill="#F9A533"/>
      </svg>
    </span>

    {/* Mastercard */}
    <span className="zf-pay-chip" title="Mastercard">
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="zf-pay-svg">
        <rect width="48" height="32" rx="4" fill="#252525"/>
        <circle cx="19" cy="16" r="8" fill="#EB001B"/>
        <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
        <path d="M24 10.3A8 8 0 0 1 24 21.7A8 8 0 0 1 24 10.3Z" fill="#FF5F00"/>
      </svg>
    </span>

    {/* Amex */}
    <span className="zf-pay-chip" title="American Express">
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="zf-pay-svg">
        <rect width="48" height="32" rx="4" fill="#2E77BC"/>
        <text x="5" y="21" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="white">AMEX</text>
      </svg>
    </span>

    {/* PayPal */}
    <span className="zf-pay-chip" title="PayPal">
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="zf-pay-svg">
        <rect width="48" height="32" rx="4" fill="#F8F8F8"/>
        <text x="6" y="21" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#003087">Pay</text>
        <text x="21" y="21" fontFamily="Arial" fontWeight="bold" fontSize="11" fill="#009CDE">Pal</text>
      </svg>
    </span>

    {/* Apple Pay */}
    <span className="zf-pay-chip" title="Apple Pay">
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="zf-pay-svg">
        <rect width="48" height="32" rx="4" fill="#141414"/>
        <text x="5" y="21" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="white">Apple Pay</text>
      </svg>
    </span>

    {/* Google Pay */}
    <span className="zf-pay-chip" title="Google Pay">
      <svg viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="zf-pay-svg">
        <rect width="48" height="32" rx="4" fill="#F8F8F8"/>
        <text x="4" y="22" fontFamily="Arial" fontWeight="bold" fontSize="10" fill="#4285F4">G</text>
        <text x="13" y="22" fontFamily="Arial" fontSize="10" fill="#5F6368">Pay</text>
      </svg>
    </span>
  </div>
);

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function FooterNavLink({ label, to }: NavLink) {
  const { trigger } = usePageTransition();
  const navigate = useNavigate();
  return (
    <li>
      <button
        onClick={() => trigger(() => navigate(to))}
        className="zf-nav-link"
      >
        {label}
      </button>
    </li>
  );
}

function FooterColumnHeader({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="zf-col-header">{children}</h4>
  );
}

/* ─────────────────────────────────────────────
   Main Footer
───────────────────────────────────────────── */
export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="zf-root">
      {/* Top separator line */}
      <div className="zf-top-line" />

      <div className="zf-container">

        {/* ── SECTION 1: 5-column main grid ── */}
        <div className="zf-main-grid">

          {/* Col 1 — Brand + Newsletter + Socials */}
          <div className="zf-brand-col">
            {/* Logo */}
            <div className="zf-logo-wrap">
              <span className="zf-logo">ZEVRAE</span>
            </div>

            {/* Short description */}
            <p className="zf-brand-desc">
              Timeless style.&nbsp;Premium quality.<br />
              Designed for the modern you.
            </p>

            {/* Newsletter */}
            <div className="zf-newsletter-block">
              <p className="zf-newsletter-label">STAY IN THE LOOP</p>
              <p className="zf-newsletter-sub">
                Be the first to know about new arrivals, exclusives &amp; style inspiration.
              </p>
              {subscribed ? (
                <p className="zf-subscribed-msg">✓ You're on the list.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="zf-newsletter-form">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Your email address"
                    className="zf-email-input"
                    required
                  />
                  <button type="submit" className="zf-subscribe-btn">
                    SUBSCRIBE
                  </button>
                </form>
              )}
            </div>

            {/* Social icons */}
            <div className="zf-socials">
              <a href="https://www.instagram.com/zevrae.co?igsh=MWhpY3E1eXZ4ZnJ4Yw==" target="_blank" rel="noreferrer" className="zf-social-icon" aria-label="Instagram">
                <Instagram size={17} strokeWidth={1.5} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="zf-social-icon" aria-label="Facebook">
                <Facebook size={17} strokeWidth={1.5} />
              </a>
              <a href="https://www.linkedin.com/company/zevrae/" target="_blank" rel="noreferrer" className="zf-social-icon" aria-label="LinkedIn">
                <Linkedin size={17} strokeWidth={1.5} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="zf-social-icon" aria-label="Twitter">
                <Twitter size={17} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Col 2 — Shop */}
          <div className="zf-link-col">
            <FooterColumnHeader>SHOP</FooterColumnHeader>
            <ul className="zf-link-list">
              {SHOP_LINKS.map(l => <FooterNavLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Col 3 — Customer Care */}
          <div className="zf-link-col">
            <FooterColumnHeader>CUSTOMER CARE</FooterColumnHeader>
            <ul className="zf-link-list">
              {CARE_LINKS.map(l => <FooterNavLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div className="zf-link-col">
            <FooterColumnHeader>LEGAL</FooterColumnHeader>
            <ul className="zf-link-list">
              {LEGAL_LINKS.map(l => <FooterNavLink key={l.label} {...l} />)}
            </ul>
          </div>

          {/* Col 5 — Contact/Support cards */}
          <div className="zf-support-col">
            <FooterColumnHeader>WE'RE HERE TO HELP</FooterColumnHeader>
            <div className="zf-support-cards">

              <div className="zf-support-card">
                <div className="zf-support-icon-wrap">
                  <Headphones size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="zf-support-card-title">Contact Us</p>
                  <p className="zf-support-card-sub">support@zevrae.com</p>
                </div>
              </div>

              <div className="zf-support-card">
                <div className="zf-support-icon-wrap">
                  <Truck size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="zf-support-card-title">Free Shipping</p>
                  <p className="zf-support-card-sub">On all orders above Rs.999</p>
                </div>
              </div>

              <div className="zf-support-card">
                <div className="zf-support-icon-wrap">
                  <ShieldCheck size={20} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="zf-support-card-title">Secure Payments</p>
                  <p className="zf-support-card-sub">100% safe &amp; encrypted</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ── SECTION 2: Feature strip ── */}
        <div className="zf-feature-strip">
          {FEATURE_CARDS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="zf-feature-card">
              <div className="zf-feature-icon">
                <Icon size={26} strokeWidth={1.4} />
              </div>
              <div>
                <p className="zf-feature-title">{title}</p>
                <p className="zf-feature-desc">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 3: Bottom bar ── */}
        <div className="zf-bottom-bar">
          <p className="zf-copyright">
            &copy; 2026 ZEVRAE. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
