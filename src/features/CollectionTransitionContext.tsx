/**
 * CollectionTransitionContext
 *
 * Provides triggerTransition(onSwap, veilColor) which CollectionScroller
 * calls when the user switches collections.
 *
 * Flow:
 *   1. Veil fades in (0 → 1, ~300ms) covering the viewport.
 *   2. onSwap() fires — updates activeIdx, theme vars, hero image.
 *   3. Veil fades out (1 → 0, ~420ms) revealing the new collection.
 *
 * Rapid clicks: any in-flight timeline is killed instantly so the latest
 * selection always wins with no stuck/flickering state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import gsap from 'gsap';

interface CollectionTransitionContextValue {
  triggerTransition: (onSwap: () => void, veilColor: string) => void;
  isCollectionTransitioning: boolean;
}

const CollectionTransitionContext =
  createContext<CollectionTransitionContextValue>({
    triggerTransition: (onSwap) => { onSwap(); },
    isCollectionTransitioning: false,
  });

export function useCollectionTransition() {
  return useContext(CollectionTransitionContext);
}

export function CollectionTransitionProvider({ children }: { children: ReactNode }) {
  const [isCollectionTransitioning, setIsCollectionTransitioning] = useState(false);
  const [veilColor, setVeilColor] = useState('transparent');
  const veilRef = useRef<HTMLDivElement | null>(null);
  // Using `any` for the gsap timeline ref to avoid import complexity
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tlRef = useRef<any>(null);

  const triggerTransition = useCallback(
    (onSwap: () => void, incomingVeilColor: string) => {
      const veil = veilRef.current;
      if (!veil) {
        // Veil not mounted — swap immediately (graceful fallback)
        onSwap();
        return;
      }

      // Kill any running timeline so rapid clicks converge on the latest pick
      if (tlRef.current) {
        tlRef.current.kill();
        tlRef.current = null;
        gsap.set(veil, { clearProps: 'opacity' });
      }

      setVeilColor(incomingVeilColor);
      setIsCollectionTransitioning(true);
      gsap.set(veil, { opacity: 0, display: 'block' });

      const tl = gsap.timeline();

      // Phase 1 — veil sweeps in
      tl.to(veil, { opacity: 1, duration: 0.30, ease: 'power2.inOut' });

      // Phase 2 — brief pause while opaque → swap happens here
      tl.call(() => { onSwap(); });
      tl.to(veil, { opacity: 1, duration: 0.06 }); // hold for 1 frame

      // Phase 3 — veil sweeps out, revealing new collection
      tl.to(veil, {
        opacity: 0,
        duration: 0.40,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(veil, { display: 'none' });
          setIsCollectionTransitioning(false);
          tlRef.current = null;
        },
      });

      tlRef.current = tl;
    },
    []
  );

  return (
    <CollectionTransitionContext.Provider
      value={{ triggerTransition, isCollectionTransitioning }}
    >
      {children}
      {/* Fixed veil — covers full viewport during transition only */}
      <div
        ref={veilRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 35,
          backgroundColor: veilColor,
          opacity: 0,
          display: 'none',
          pointerEvents: 'none',
        }}
      />
    </CollectionTransitionContext.Provider>
  );
}
