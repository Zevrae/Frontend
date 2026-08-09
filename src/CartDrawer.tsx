import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { useAuthModal } from './AuthModalContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/UseAuth';

export default function CartDrawer() {
  const { items, removeFromCart, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { setIsLoginModalOpen } = useAuthModal();
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    if (!token) {
      setIsLoginModalOpen(true);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-[var(--theme-bg)] border-l border-[rgba(var(--theme-text-rgb),0.1)] z-[70] flex flex-col text-[var(--theme-text)]"
          >
            <div className="p-6 border-b border-[rgba(var(--theme-text-rgb),0.1)] flex justify-between items-center">
              <h2 className="text-lg font-archivo font-bold tracking-[0.1em] uppercase flex items-center gap-3 text-[var(--theme-text)]" style={{ fontStretch: '125%' }}>
                <ShoppingBag size={18} />
                BAG ({items.length})
              </h2>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-gray-500 hover:text-[var(--theme-text)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <ShoppingBag size={32} strokeWidth={1} />
                  <p className="text-xs tracking-widest uppercase">Your cart is empty</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4">
                    <div className="w-20 aspect-[3/4] bg-[var(--theme-surface)] overflow-hidden flex-shrink-0">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-medium uppercase tracking-wider pr-4">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id, item.size)}
                            className="text-gray-500 hover:text-[var(--theme-text)] transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
                          Size: {item.size}
                        </p>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-[10px] text-gray-500 tracking-widest uppercase">
                          Qty: {item.quantity}
                        </div>
                        <div className="text-sm font-light">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-[rgba(var(--theme-text-rgb),0.1)] bg-[var(--theme-bg)]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs uppercase tracking-widest text-gray-400">Total</span>
                  <span className="text-lg font-light">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(cartTotal)}</span>
                </div>
                <button 
                  onClick={handleCheckoutClick}
                  className="w-full bg-white text-black py-4 uppercase tracking-[0.2em] text-xs hover:bg-gray-200 transition-colors"
                >
                  Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
