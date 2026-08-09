import { useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
type CursorState = 'default' | 'button' | 'link' | 'image';

interface CursorVars {
  mouseX: number;
  mouseY: number;
  x: number;
  y: number;
  state: CursorState;
  isClicking: boolean;
  isVisible: boolean;
  currentSize: number;
  targetSize: number;
  viewOpacity: number;
  targetViewOpacity: number;
  borderOpacity: number;
  targetBorderOpacity: number;
  fillOpacity: number;
  targetFillOpacity: number;
  clickScale: number;
  targetClickScale: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
// A CSS custom property, not a literal color — it resolves against
// whatever category theme is active and updates automatically when the
// theme swaps, no re-render or JS needed.
const GOLD = 'var(--theme-accent)';
const DOT_SIZE = 10;
const BUTTON_SIZE = 22;
const IMAGE_SIZE = 80;
const LERP_FACTOR = 1; // position tracks the real pointer 1:1, no lag
const SIZE_LERP = 0.12;
const OPACITY_LERP = 0.12;
const CLICK_LERP = 0.18;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const borderRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const vars = useRef<CursorVars>({
    mouseX: -100,
    mouseY: -100,
    x: -100,
    y: -100,
    state: 'default',
    isClicking: false,
    isVisible: false,
    currentSize: DOT_SIZE,
    targetSize: DOT_SIZE,
    viewOpacity: 0,
    targetViewOpacity: 0,
    borderOpacity: 0,
    targetBorderOpacity: 0,
    fillOpacity: 1,
    targetFillOpacity: 1,
    clickScale: 1,
    targetClickScale: 1,
  });

  // ── Determine state from hovered element ─────────────────────────────────
  const resolveState = useCallback((el: Element | null): void => {
    const v = vars.current;
    if (!el) return;

    const isButton =
      el.closest('button') !== null ||
      el.closest('[role="button"]') !== null;

    const isLink = !isButton && el.closest('a') !== null;

    const isImage =
      !isButton &&
      !isLink &&
      (el.closest('[data-cursor-image]') !== null ||
        el.closest('.product-image-zone') !== null);

    if (isButton) {
      v.state = 'button';
      v.targetSize = BUTTON_SIZE;
      v.targetFillOpacity = 0;
      v.targetBorderOpacity = 1;
      v.targetViewOpacity = 0;
    } else if (isLink) {
      v.state = 'link';
      v.targetSize = DOT_SIZE;
      v.targetFillOpacity = 1;
      v.targetBorderOpacity = 0;
      v.targetViewOpacity = 0;
    } else if (isImage) {
      v.state = 'image';
      v.targetSize = IMAGE_SIZE;
      v.targetFillOpacity = 0;
      v.targetBorderOpacity = 1;
      v.targetViewOpacity = 1;
    } else {
      v.state = 'default';
      v.targetSize = DOT_SIZE;
      v.targetFillOpacity = 1;
      v.targetBorderOpacity = 0;
      v.targetViewOpacity = 0;
    }
  }, []);

  // ── Event handlers ───────────────────────────────────────────────────────
  const onMouseMove = useCallback((e: MouseEvent) => {
    const v = vars.current;
    v.mouseX = e.clientX;
    v.mouseY = e.clientY;
    if (!v.isVisible) {
      v.x = e.clientX;
      v.y = e.clientY;
      v.isVisible = true;
    }
    resolveState(e.target as Element | null);
  }, [resolveState]);

  const onMouseDown = useCallback(() => {
    const v = vars.current;
    v.isClicking = true;
    v.targetClickScale = 0.6;
  }, []);

  const onMouseUp = useCallback(() => {
    const v = vars.current;
    v.isClicking = false;
    v.targetClickScale = 1;
  }, []);

  const onMouseLeave = useCallback(() => {
    vars.current.isVisible = false;
  }, []);

  const onMouseEnter = useCallback(() => {
    vars.current.isVisible = true;
  }, []);

  // ── Animation loop ───────────────────────────────────────────────────────
  const animate = useCallback(() => {
    const dot = dotRef.current;
    const fill = fillRef.current;
    const border = borderRef.current;
    const view = viewRef.current;

    if (dot) {
      const v = vars.current;

      // Lerp position
      v.x = lerp(v.x, v.mouseX, LERP_FACTOR);
      v.y = lerp(v.y, v.mouseY, LERP_FACTOR);

      // Lerp size
      v.currentSize = lerp(v.currentSize, v.targetSize, SIZE_LERP);

      // Lerp opacities
      v.viewOpacity = lerp(v.viewOpacity, v.targetViewOpacity, OPACITY_LERP);
      v.borderOpacity = lerp(v.borderOpacity, v.targetBorderOpacity, OPACITY_LERP);
      v.fillOpacity = lerp(v.fillOpacity, v.targetFillOpacity, OPACITY_LERP);

      // Lerp click scale
      v.clickScale = lerp(v.clickScale, v.targetClickScale, CLICK_LERP);

      // Compute scale modifier for link state
      const linkScale = v.state === 'link' ? 1.6 : 1;
      const finalScale = v.clickScale * linkScale;

      const half = v.currentSize / 2;
      const opacity = v.isVisible ? 1 : 0;

      dot.style.transform = `translate(${v.x - half}px, ${v.y - half}px) scale(${finalScale})`;
      dot.style.width = `${v.currentSize}px`;
      dot.style.height = `${v.currentSize}px`;
      dot.style.opacity = String(opacity);

      if (fill)   fill.style.opacity = String(v.fillOpacity);
      if (border) border.style.opacity = String(v.borderOpacity);
      if (view)   view.style.opacity = String(v.viewOpacity);
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  // ── Lifecycle ────────────────────────────────────────────────────────────
  useEffect(() => {
    // Suppress native cursor site-wide on non-touch devices
    const style = document.createElement('style');
    style.id = 'zevrae-cursor-none';
    style.textContent = '@media (hover: hover) and (pointer: fine) { *, *::before, *::after { cursor: none !important; } }';
    document.head.appendChild(style);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown, { passive: true });
    window.addEventListener('mouseup', onMouseUp, { passive: true });
    document.documentElement.addEventListener('mouseleave', onMouseLeave);
    document.documentElement.addEventListener('mouseenter', onMouseEnter);

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      const s = document.getElementById('zevrae-cursor-none');
      if (s) s.remove();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.documentElement.removeEventListener('mouseleave', onMouseLeave);
      document.documentElement.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate, onMouseMove, onMouseDown, onMouseUp, onMouseLeave, onMouseEnter]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="hidden md:block"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: `${DOT_SIZE}px`,
        height: `${DOT_SIZE}px`,
        pointerEvents: 'none',
        zIndex: 99999,
        willChange: 'transform, width, height',
        opacity: 0,
        // No transition — all movement handled by rAF lerp
      }}
    >
      {/* Solid gold dot (default + link states) */}
      <div
        ref={fillRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          backgroundColor: GOLD,
        }}
      />

      {/* Outlined ring (button + image states) */}
      <div
        ref={borderRef}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px solid ${GOLD}`,
          opacity: 0,
        }}
      />

      {/* VIEW label (image state only) */}
      <div
        ref={viewRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0,
          color: GOLD,
          fontSize: '8px',
          fontFamily: '"IBM Plex Mono", monospace',
          letterSpacing: '0.3em',
          fontWeight: 500,
          userSelect: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        VIEW
      </div>
    </div>
  );
}
