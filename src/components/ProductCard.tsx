import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Product } from '../data';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link 
      to={`/product/${product.id}`}
      state={{ product }}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#111] mb-6">
        <motion.img 
          initial={{ scale: 1 }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          src={isHovered ? product.backImage : product.frontImage} 
          alt={product.name}
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-white mb-1 uppercase tracking-wider">{product.name}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-widest">{product.category}</p>
        </div>
        <span className="text-sm font-light text-white">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price)}</span>
      </div>
    </Link>
  );
};
