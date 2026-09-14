'use client';

import Image from 'next/image';
import { ShoppingBag, X } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useRouter } from 'next/navigation';
import { useAuth } from './hooks/UseAuth';
import { isSoftToy, formatSoftToySize } from './utils/sizeFormatter';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from './components/ui/sheet';
import { Button } from './components/ui/button';

export default function CartDrawer() {
  const { items, removeFromCart, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const router = useRouter();
  const { token } = useAuth();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!token) {
      setIsLoginModalOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent
        side="right"
        className="w-full sm:w-[420px] p-0 flex flex-col justify-between border-l border-[rgba(var(--theme-accent-rgb),0.2)] bg-[var(--theme-bg)] text-[var(--theme-text)] z-[70]"
      >
        <SheetHeader className="p-6 border-b border-[rgba(var(--theme-accent-rgb),0.15)] flex flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-base font-archivo font-bold tracking-[0.15em] uppercase flex items-center gap-3 text-[var(--theme-text)]">
            <ShoppingBag size={18} className="text-[var(--theme-accent)]" />
            BAG ({items.length})
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-[rgba(var(--theme-text-rgb),0.4)] space-y-4">
              <div className="w-16 h-16 rounded-full border border-[rgba(var(--theme-accent-rgb),0.2)] flex items-center justify-center">
                <ShoppingBag size={28} strokeWidth={1} className="text-[var(--theme-accent)]" />
              </div>
              <p className="text-xs font-plex-mono tracking-[0.2em] uppercase">Your bag is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 group">
                <div className="relative w-20 aspect-[3/4] bg-[var(--theme-surface)] overflow-hidden flex-shrink-0 border border-[rgba(var(--theme-accent-rgb),0.1)] rounded-xs">
                  {item.image && (
                    <Image fill sizes="80px" src={item.image} alt={item.name} className="object-cover" />
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-xs font-plex-mono font-medium uppercase tracking-wider pr-4 text-[var(--theme-text)]">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-accent)] transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] uppercase tracking-widest mt-1">
                      Size: {isSoftToy(item.category) ? formatSoftToySize(item.size) : item.size}
                    </p>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-[10px] font-plex-mono text-[rgba(var(--theme-text-rgb),0.5)] tracking-widest uppercase">
                      Qty: {item.quantity}
                    </div>
                    <div className="text-sm font-archivo font-medium text-[var(--theme-accent)]">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[rgba(var(--theme-accent-rgb),0.15)] bg-[rgba(var(--theme-surface-rgb),0.4)] backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-plex-mono uppercase tracking-[0.2em] text-[rgba(var(--theme-text-rgb),0.6)]">Total</span>
              <span className="text-lg font-archivo font-bold text-[var(--theme-accent)]">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartTotal)}
              </span>
            </div>
            <Button
              onClick={handleCheckoutClick}
              variant="default"
              className="w-full h-12"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
