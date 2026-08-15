import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import anime from 'animejs';
import { Sparkles, ChevronLeft } from 'lucide-react';
import './ComingSoon.css';

export default function ComingSoon() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // GSAP: entrance choreography for the page shell / text
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(glowRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.6, ease: 'power2.out' })
        .fromTo(
          titleRef.current?.querySelectorAll('.csw') || [],
          { yPercent: 120, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 1, stagger: 0.08 },
          '-=1.1'
        )
        .fromTo(subRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.5')
        .fromTo(buttonRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.4');

      // Slow ambient drift on the glow — a subtle "still alive" heartbeat
      gsap.to(glowRef.current, {
        scale: 1.08,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // anime.js: interactive micro-animation on the CTA button — a traveling
  // shine sweep on hover, and a satisfying pulse on click.
  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    const handleEnter = () => {
      anime({
        targets: '.cs-shine',
        translateX: ['-120%', '220%'],
        duration: 900,
        easing: 'easeInOutQuad',
      });
    };

    const handleClick = () => {
      anime({
        targets: btn,
        scale: [1, 0.94, 1],
        duration: 420,
        easing: 'easeOutElastic(1, .6)',
      });
    };

    btn.addEventListener('mouseenter', handleEnter);
    btn.addEventListener('click', handleClick);
    
    return () => {
      btn.removeEventListener('mouseenter', handleEnter);
      btn.removeEventListener('click', handleClick);
    };
  }, []);

  const notifyClick = () => {
    // No backend endpoint for a waitlist exists yet — this is a placeholder
    // interaction until one is wired up (e.g. POST /api/waitlist).
    const btn = buttonRef.current;
    if (btn) {
      const label = btn.querySelector('.cs-label');
      if (label) label.textContent = 'NOTED — WE\u2019LL BE IN TOUCH';
    }
  };

  return (
    <div ref={containerRef} className="coming-soon-page">
      {/* Back Button added to match .cs-back CSS */}
      <button onClick={() => navigate('/')} className="cs-back">
        <ChevronLeft size={16} /> Back
      </button>

      <div ref={glowRef} className="cs-glow" aria-hidden="true" />

      <div className="cs-content">
        <p className="cs-eyebrow">
          <Sparkles size={12} /> AI Wardrobe
        </p>
        <h1 ref={titleRef} className="cs-title" aria-label="Coming Soon">
          {'COMING SOON'.split('').map((ch, i) => (
            <span className="csw" key={i} style={{ display: 'inline-block' }}>
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </h1>
        <p ref={subRef} className="cs-sub">
          We're building an AI-styled wardrobe experience tailored to you.
          Be the first to know when it launches.
        </p>
        <button ref={buttonRef} onClick={notifyClick} className="cs-button">
          <span className="cs-shine" />
          <span className="cs-label">NOTIFY ME</span>
        </button>
      </div>
    </div>
  );
}