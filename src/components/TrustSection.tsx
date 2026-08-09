import { motion } from 'motion/react';
import { ShieldCheck, RefreshCw, Sparkles, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePageTransition } from '../features/PageTransitionContext';

// Google OAuth verification requires the homepage to plainly state what the
// app does and why Google Sign-In is offered. This section carries that
// information but is designed to read as a normal "why shop with us" trust
// block — same fonts, spacing, motion, and palette as the rest of the
// storefront — rather than a bolted-on compliance notice.
const PILLARS = [
  {
    icon: Sparkles,
    title: 'What Zevrae Is',
    body:
      'Zevrae is a minimalist fashion and jewellery label — shop new arrivals, try garments on virtually with AI before you buy, and check out in a few taps.',
  },
  {
    icon: Lock,
    title: 'Secure Sign-In',
    body:
      'Signing in with Google means Zevrae never sees or stores your password. Google verifies your identity; we only receive your name and email to open your account.',
  },
  {
    icon: RefreshCw,
    title: 'Synced Everywhere',
    body:
      'Your bag, saved sizes, and try-on history follow you across devices the moment you sign in — pick up on your phone exactly where you left off on desktop.',
  },
  {
    icon: ShieldCheck,
    title: 'Made For You',
    body:
      'Your fit, style, and past orders shape the recommendations and virtual try-on suggestions you see — nothing generic, nothing shared with third-party advertisers.',
  },
] as const;

export function TrustSection() {
  const navigate = useNavigate();
  const { trigger: navTransition } = usePageTransition();

  const goTo = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navTransition(() => navigate(path));
  };

  return (
    <section className="relative bg-[var(--theme-bg)] py-24 md:py-32 px-6 md:px-12 border-t border-[rgba(var(--theme-accent-rgb),0.1)]">
      <div className="max-w-[1400px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[var(--theme-accent)] mb-4 text-center md:text-left"
        >
          Why Zevrae
        </motion.h2>
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[var(--theme-text)] text-center md:text-left uppercase mb-16 md:mb-20 max-w-3xl"
        >
          A Faster, Safer Way to Shop
        </motion.h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8 mb-16">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex flex-col items-start"
            >
              <div className="w-10 h-10 rounded-full border border-[rgba(var(--theme-accent-rgb),0.3)] flex items-center justify-center mb-6">
                <pillar.icon size={16} strokeWidth={1.5} className="text-[var(--theme-accent)]" />
              </div>
              <h4 className="font-archivo font-semibold tracking-[0.05em] text-[var(--theme-text)] uppercase text-sm mb-3">
                {pillar.title}
              </h4>
              <p className="font-plex-mono text-[13px] leading-relaxed text-[rgba(var(--theme-text-rgb),0.6)]">
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-plex-mono text-[11px] text-[rgba(var(--theme-text-rgb),0.4)] tracking-[0.02em] leading-relaxed max-w-2xl"
        >
          By continuing with Google, you agree to Zevrae's{' '}
          <a
            href="/terms-of-service"
            onClick={goTo('/terms-of-service')}
            className="text-[var(--theme-accent)]/80 hover:text-[var(--theme-accent)] underline underline-offset-4 transition-colors duration-300"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy-policy"
            onClick={goTo('/privacy-policy')}
            className="text-[var(--theme-accent)]/80 hover:text-[var(--theme-accent)] underline underline-offset-4 transition-colors duration-300"
          >
            Privacy Policy
          </a>
          , which explain exactly what we collect and how it's used.
        </motion.p>
      </div>
    </section>
  );
}

export default TrustSection;
