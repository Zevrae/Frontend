import { create } from 'zustand';
import type { ThemeName, TransitionPhase } from './types';

interface UIState {
  // Collection / Category
  activeCollectionId: ThemeName;
  setActiveCollectionId: (id: ThemeName) => void;

  // Preloader
  isPreloaderLoading: boolean;
  hasPreloaderCompletedOnce: boolean;
  finishPreloader: () => void;

  // Page Transitions
  isTransitioning: boolean;
  transitionPhase: TransitionPhase;
  transitionTheme: ThemeName | null;
  transitionCallback?: () => void;
  triggerPageTransition: (callback?: () => void, targetTheme?: ThemeName | null) => void;
  setTransitionPhase: (phase: TransitionPhase) => void;
  forceResetTransition: () => void;

  // Navigation & Modals
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  quickViewProductId: string | null;
  setQuickViewProductId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  // Collection Tab
  activeCollectionId: 'clothing',
  setActiveCollectionId: (id: ThemeName) => set({ activeCollectionId: id }),

  // Preloader
  isPreloaderLoading: true,
  hasPreloaderCompletedOnce: false,
  finishPreloader: () => set({ isPreloaderLoading: false, hasPreloaderCompletedOnce: true }),

  // Page Transitions
  isTransitioning: false,
  transitionPhase: 'idle',
  transitionTheme: null,
  transitionCallback: undefined,

  triggerPageTransition: (callback, targetTheme) => {
    const { isTransitioning } = get();
    if (isTransitioning) return;

    set({
      isTransitioning: true,
      transitionPhase: 'entering',
      transitionTheme: targetTheme || null,
      transitionCallback: callback,
    });
  },

  setTransitionPhase: (phase: TransitionPhase) => {
    if (phase === 'holding') {
      const cb = get().transitionCallback;
      set({ transitionCallback: undefined });
      try {
        cb?.();
      } catch (err) {
        console.error('[UIStore] transition navigation callback failed:', err);
      }
    }

    if (phase === 'idle') {
      set({
        isTransitioning: false,
        transitionPhase: 'idle',
        transitionTheme: null,
        transitionCallback: undefined,
      });
      return;
    }

    set({
      transitionPhase: phase,
      isTransitioning: true,
    });
  },

  forceResetTransition: () => {
    set({
      isTransitioning: false,
      transitionPhase: 'idle',
      transitionTheme: null,
      transitionCallback: undefined,
    });
  },

  // Navigation & Modals
  mobileMenuOpen: false,
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  quickViewProductId: null,
  setQuickViewProductId: (quickViewProductId) => set({ quickViewProductId }),
}));
