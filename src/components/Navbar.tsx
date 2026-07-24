import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, ChevronDown } from 'lucide-react';
import { useCart } from '../CartContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const { items, setIsCartOpen } = useCart();
  const [isClothingOpen, setIsClothingOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClothingOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${isHome ? 'bg-transparent text-white' : 'bg-[#12100C] text-white border-b border-white/10'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button className="lg:hidden">
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:flex items-center gap-8 text-xs tracking-[0.2em] uppercase">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsClothingOpen(!isClothingOpen)}
                className="flex items-center gap-1 hover:text-gray-400 transition-colors tracking-[0.2em] uppercase focus:outline-none"
              >
                Clothing
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isClothingOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <div 
                className={`absolute top-full left-0 mt-6 w-40 bg-[#12100C] border border-white/10 shadow-2xl transition-all duration-300 ${
                  isClothingOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 translate-y-2 invisible'
                }`}
              >
                <div className="flex flex-col py-2">
                  <Link 
                    to="/men" 
                    className="px-6 py-3 hover:bg-white/5 hover:text-white transition-all text-gray-300"
                    onClick={() => setIsClothingOpen(false)}
                  >
                    Men
                  </Link>
                  <Link 
                    to="/women" 
                    className="px-6 py-3 hover:bg-white/5 hover:text-white transition-all text-gray-300"
                    onClick={() => setIsClothingOpen(false)}
                  >
                    Women
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Link to="/" className="text-2xl font-archivo font-bold tracking-widest uppercase absolute left-1/2 -translate-x-1/2">
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
