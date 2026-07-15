import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '../CartContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { items, setIsCartOpen } = useCart();
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isHome ? 'bg-transparent text-white' : 'bg-[#12100C] text-white border-b border-white/10'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-8 text-xs tracking-[0.2em] uppercase">
            <Link to="/men" className="hover:text-gray-400 transition-colors">Men</Link>
            <Link to="/women" className="hover:text-gray-400 transition-colors">Women</Link>
          </div>
        </div>

        <Link to="/" className="text-2xl font-serif tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
          Zevrae
        </Link>

        <div className="flex items-center gap-6">
          <button 
            className="hover:text-gray-400 transition-colors relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white text-black text-[8px] flex items-center justify-center rounded-full font-medium">
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
