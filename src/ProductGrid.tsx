import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import ProductCardSober from './components/ProductCardSober';
import PinterestCard from './components/PinterestCard';
import './components/PinterestCard.css';
import ComingSoon from './pages/comingsoon/ComingSoon';
const products = [];
const mensCategories = [
  {
    id: 'tshirts',
    name: 'TSHIRTS',
    image: 'https://i.ibb.co/PZvccJ85/THE-WHITE-MONSTER-FRONT.png',
    path: '/men/tshirts'
  },
  {
    id: 'lowers',
    name: 'LOWERS',
    image: 'https://i.ibb.co/RGyBrL7q/THE-DRAGON-LOWER-FRONT.jpg',
    path: '/men/lowers'
  }
];
const womenProducts = [
];
const womensCategories = [
  {
    id: 'tshirts',
    name: 'TSHIRTS',
    image: 'https://i.ibb.co/21qqDjDv/LIGHTNING-MCQUEEN-BLACK.png',
    path: '/women/tshirts'
  },
  {
    id: 'lowers',
    name: 'LOWERS',
    image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1920&auto=format&fit=crop',
    path: '/women/lowers'
  }
];
const jewelleryCategories = [
  {
    id: 'rings',
    name: 'RINGS',
    image: 'https://i.ibb.co/hJ98rRh6/White-K-Year-of-Snake-Ring.png',
    fit: 'contain',
    path: '/jewellery/rings'
  },
  {
    id: 'pendants',
    name: 'PENDANTS',
    image: 'https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png',
    fit: 'contain',
    path: '/jewellery/pendants'
  },
  {
    id: 'bracelet',
    name: 'BRACELET',
    image: 'https://i.ibb.co/4ZR90MKP/Gold-Year-of-Snake-Bracelet.png',
    fit: 'contain',
    path: '/jewellery/bracelet'
  },
  {
    id: 'earrings',
    name: 'EARRINGS',
    image: 'https://i.ibb.co/y72Tgjg/Earing-set.png',
    fit: 'contain',
    path: '/jewellery/earrings'
  }
];

const accessoriesCategories = [
  {
    id: 'keychain',
    name: 'KEYCHAIN',
    image: 'https://i.ibb.co/fdt5NJjf/Bright-Red-Metallic-Cherry-Keychain.png',
    fit: 'contain',
    path: '/accessories/keychain'
  },
  {
    id: 'toys',
    name: 'TOYS',
    image: 'https://i.ibb.co/SDxn1n3c/Cute-Sun-Moon-Plush-Doll.png',
    fit: 'contain',
    path: '/accessories/toys'
  }
];
const jewelleryProducts = [
  {
    id: 'e1',
    name: "Crystal Diamond Ear Piece Set",
    price: 400,
    originalPrice: 741,
    discount: "46% OFF",
    category: "earrings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/VWLKTS78/Crystal-Diamond-Ear-Piece-Set.png",
  },
  {
    id: 'e2',
    name: "Criss Cross Earrinngs",
    price: 599,
    originalPrice: 1099,
    discount: "46% OFF",
    category: "earrings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/2YCcCrMP/Criss-Cross-Earrinngs.png",
  },
  {
    id: 'e3',
    name: "Earing Set",
    price: 999,
    originalPrice: 1850,
    discount: "46% OFF",
    category: "earrings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/y72Tgjg/Earing-set.png",
  },
  {
    id: 'e4',
    name: "Classic Cross Sword Alloy Ear Studs",
    price: 999,
    originalPrice: 1850,
    discount: "46% OFF",
    category: "earrings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/QF8Lgc0X/Classic-Cross-Sword-Alloy-Ear-Studs.png",
  },
  {
    id: 'e5',
    name: "Pearl Earing Set",
    price: 899,
    originalPrice: 1750,
    discount: "46% OFF",
    category: "earrings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/gBdGJcx/Pearl-Earing-Set.png",
  },
  {
    id: 'e6',
    name: "Vintage Gold Geometric Ladies Earrings Set",
    price: 899,
    originalPrice: 1750,
    discount: "46% OFF",
    category: "earrings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/VYSvSp6y/Vintage-Gold-Geometric-Ladies-Earrings-Set.png",
  },
  { 
    id: 'r1',
    name: "Ice Land Wolf",
    price: 299,
    originalPrice: 549,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/xq37SZv4/Ice-Land-Wolf.png",
  },
  {
    id: 'r2',
    name: "Ice Wolf",
    price: 299,
    originalPrice: 549,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/1GJ1YMrV/Ice-Wolf.png",
  },
  {
    id: 'r3',
    name: "Cross Punk",
    price: 250,
    originalPrice: 463,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/MxZ71W6C/Cross-ring-FRONT.png",
    backImg: "https://i.ibb.co/b5QqkrpQ/Cross-ring-BACK.png"
  },
  {
    id: 'r4',
    name: "8 piece Flower Ring Set Gold",
    price: 899,
    originalPrice: 1665,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/DDfZmRfC/8-piece-Flower-Ring-Set-Gold.png",
  },
  {
    id: 'r5',
    name: "Elegant Modern Style Heart Shape Copper Plating Open Rings",
    price: 399,
    originalPrice: 739,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/5HLF5fC/Elegant-Modern-Style-Heart-Shape-Copper-Plating-Open-Rings-FRONT.webp",
    backImg: "https://i.ibb.co/XkCX2hcZ/Elegant-Modern-Style-Heart-Shape-Copper-Plating-Open-Rings-BACK.png"
  },
  {
    id: 'r6',
    name: "Golden Sun Flower Ring Women's",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/rR9PmvDh/Golden-Sun-Flower-Ring-Women-s-FRONT.png",
    backImg: "https://i.ibb.co/BVQwwSVP/Golden-Sun-Flower-Ring-Women-s-BACK.png"
  },
  {
    id: 'r7',
    name: "Golden Tiger Ring Women's",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/q33rh5D2/Golden-Tiger-Eye-Ring-Women-s-FRONT.png",
    backImg: "https://i.ibb.co/PzbR5ZhP/Golden-Tiger-Eye-Ring-Women-s-BACK.png"
  },
  {
    id: 'r8',
    name: "Hot Sale Men's And Women's Hematite Ring",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/x8Ld0B5N/Hot-Sale-Men-s-And-Women-s-Hematite-Ring-FRONT.png",
    backImg: "https://i.ibb.co/wrJJt6Kt/Hot-Sale-Men-s-And-Women-s-Hematite-Ring-BACK.png"
  },
  {
    id: 'r9',
    name: "Vintage Butterfly Snake-Shaped Gemstone Ring Set",
    price: 1199,
    originalPrice: 2199,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/ksMvmC2q/Vintage-Butterfly-Snake-Shaped-Gemstone-Ring-Set-FRONT.png",
    backImg: "https://i.ibb.co/hRy1pvVS/Vintage-Butterfly-Snake-Shaped-Gemstone-Ring-Set-BACK.png"
  },
  {
    id: 'r10',
    name: "Vintage Dragon Ring",
    price: 399,
    originalPrice: 799,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/xq2GcfyP/Vintage-Dragon-Ring-FRONT.png",
    backImg: "https://i.ibb.co/zHFf9RyC/Vintage-Dragon-Ring-BACK.png"
  },
  {
    id: 'r11',
    name: "White Year of Snake Ring",
    price: 399,
    originalPrice: 799,
    discount: "46% OFF",
    category: "rings",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/hJ98rRh6/White-K-Year-of-Snake-Ring.png",
  },
  {
    id: 'b1',
    name: "304 Stainless Steel Geometric",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/67FKTVzz/304-Stainless-Steel-Geometric.png",
  },
  {
    id: 'b2',
    name: "304 Stainless Steel Geometric Flower",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/8gvy4Hyh/304-Stainless-Steel-Geometric-Flower.png",
  },
  {
    id: 'b3',
    name: "304 Stainless Steel Geometric Lotus",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/QjdVf8HV/304-Stainless-Steel-Geometric-Lotus.png",
  },
  {
    id: 'b4',
    name: "Circular Shape Twist Hammered Bangle",
    price: 499,
    originalPrice: 899,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/d4T8GZyX/Circular-Shape-Twist-Hammered-Bangle-FRONT.png",
    backImg: "https://i.ibb.co/pvM5fnjL/Circular-Shape-Twist-Hammered-Bangle-BACK.png"
  },
  {
    id: 'b5',
    name: "C Shaped Bamboo Bracelet Gold",
    price: 599,
    originalPrice: 1110,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/MDJR8SrF/C-shaped-Bamboo-Bracelet-Gold.png",
  },
  {
    id: 'b6',
    name: "Full Diamond Bracelet",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/pBXXbKWx/Full-Diamond-Bracelet-FRONT.png",
    backImg: "https://i.ibb.co/RGMV1cF4/Full-Diamond-Bracelet-BACK.png"
  },
  {
    id: 'b7',
    name: "Geometric Metal Bangle",
    price: 799,
    originalPrice: 1594,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/gMpHt20V/Geometric-Metal-Bangle-FRONT.png",
    backImg: "https://i.ibb.co/BVzm3Ffp/Geometric-Metal-Bangle-BACK.png"
  },
  {
    id: 'b8',
    name: "Gold Fashion Creative Round Love Cross Bracelet 4 Piece",
    price: 899,
    originalPrice: 1665,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/mFXGCbbm/Gold-Fashion-Creative-Round-Love-Cross-Bracelet-4-piece.png",
  },
  {
    id: 'b9',
    name: "Gold Year of Snake Bracelet",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/4ZR90MKP/Gold-Year-of-Snake-Bracelet.png",
  },
  {
    id: 'b10',
    name: "Red Cross Two Tone Double Layer Bracelet",
    price: 499,
    originalPrice: 924,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/gMdcpzwp/Red-Cross-Two-tone-Double-layer-Bracelet-FRONT.png",
    backImg: "https://i.ibb.co/zhvxqx65/Red-Cross-Two-tone-Double-layer-Bracelet-BACK.png"
  },
  {
    id: 'b11',
    name: "Round Love Cross Bracelet 4 Piece",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/C3fZbrkc/Round-Love-Cross-Bracelet-4-piece-FRONT.png",
    backImg: "https://i.ibb.co/mCfK338t/Round-Love-Cross-Bracelet-4-piece-BACK.png"
  },
  {
    id: 'b12',
    name: "Silver Fashion Creative Round Love Cross Bracelet 4 Piece",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/XZPks71K/Silver-Fashion-Creative-Round-Love-Cross-Bracelet-4-piece.png",
  },
  {
    id: 'b13',
    name: "Silver Rounded Dragon Bracelet",
    price: 899,
    originalPrice: 1665,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/svRJsdG1/Silver-Rounded-Dragon-Bracelte.png",
  },
  {
    id: 'b14',
    name: "Silver Snake Metal Plating Snake Women's",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/VWJ9wRKK/Silver-Snake-Metal-Plating-Snake-Women-s.png",
  },
  {
    id: 'b15',
    name: "Star Gold Platted Bracelet",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "bracelet",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/pv2rXCBc/Star-Gold-Platted-Bracelte.png",
  },

  {
    id: 'p1',
    name: "Bohemian Love Metal Waist Chain",
    price: 599,
    originalPrice: 1109,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/vvxnzFys/Bohemian-Love-Metal-Waist-Chain-FRONT.png",
    backImg: "https://i.ibb.co/rPdn3VQ/Bohemian-Love-Metal-Waist-Chain-BACK.png",
  },

  {
    id: 'p2',
    name: "Bohemian Retro Metal Waist Chain",
    price: 599,
    originalPrice: 1109,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/7tLBVS1m/Bohemian-Retro-Metal-Waist-Chain-FRONT.png",
    backImg: "https://i.ibb.co/HLJF69cb/Bohemian-Retro-Metal-Waist-Chain-BACK.png",
  },

  {
    id: 'p3',
    name: "Bow Knot Gold Platted Chain",
    price: 359,
    originalPrice: 665,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/YFtXmfph/Bow-Knot-Gold-Platted-Chain.png",
  },

  {
    id: 'p4',
    name: "Box Chain Small Cherry Chain",
    price: 499,
    originalPrice: 741,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/TZZ6T57/Box-Chain-Small-Cherry-Chain.png",
  },

  {
    id: 'p5',
    name: "Classic Versatile 18K Gold Plated Jewelry",
    price: 499,
    originalPrice: 741,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/Kp4FH8tK/Classic-Versatile-18-K-Gold-Plated-Jewelry.png",
  },

  {
    id: 'p6',
    name: "Dragon Totem Pendant Necklace",
    price: 599,
    originalPrice: 1109,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/vxqSf1h9/Dragon-Totem-Pendant-Necklace-FRONT.png",
    backImg: "https://i.ibb.co/gLjgx5J5/Dragon-Totem-Pendant-Necklace-BACK.png",
  },

  {
    id: 'p7',
    name: "Gold Leaf Pendant",
    price: 499,
    originalPrice: 741,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/yF4169V9/Gold-Leaf-Pendant.png",
  },

  {
    id: 'p8',
    name: "Gold Sunflower Pendant",
    price: 599,
    originalPrice: 1109,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/PzPQ3vgB/Gold-Sunflower-Pendant.png",
  },

  {
    id: 'p9',
    name: "Retro Style Cross Necklace",
    price: 599,
    originalPrice: 1109,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/LXpFjHV3/Retro-Style-Cross-Necklace-FRONT.png",
    backImg: "https://i.ibb.co/5h2kKKnx/Retro-Style-Cross-Necklace-BACK.png",
  },

  {
    id: 'p10',
    name: "Round Bead Chain Double-layer Women's",
    price: 699,
    originalPrice: 1209,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/FLV0GmJR/Round-Bead-Chain-Double-layer-Women-s-FRONT.png",
    backImg: "https://i.ibb.co/hxVSz8kJ/Round-Bead-Chain-Double-layer-Women-s-BACK.png",
  },

  {
    id: 'p11',
    name: "Simple Style Hand",
    price: 499,
    originalPrice: 741,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/hFy6j877/Simple-Style-Hand-FRONT.png",
    backImg: "https://i.ibb.co/WpBVbzrj/Simple-Style-Hand-BACK.png",
  },

  {
    id: 'p12',
    name: "Single Gold Platted Layered Ball Chain",
    price: 499,
    originalPrice: 741,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/8nQtVmgL/Single-Gold-Platted-Layered-Ball-Chain.png",
  },

  {
    id: 'p13',
    name: "Zircon Star Moon Chain",
    price: 499,
    originalPrice: 741,
    discount: "46% OFF",
    category: "pendants",
    label: "Jewellery Premium",
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/DPhjc1S8/Zircon-Star-Moon-Chain.png",
  },

];
export default function ProductGrid({ categoryFilter = 'all' }: { categoryFilter?: 'all' | 'men' | 'women' | 'jewellery' | 'accessories' | 'rings' | 'pendants' | 'keychain' | 'bracelet' | 'toys' | 'earrings' | 'men-tshirts' | 'men-lowers' | 'women-tshirts' | 'women-lowers' }) {
  const navigate = useNavigate();

  const [dbProducts, setDbProducts] = useState<any[]>([]);

  useEffect(() => {
    const fetchDbProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        
        const formatted = (data || []).filter((p: any) => p.status === 'active').map((p: any) => {
          const isJewellery = p.category?.toLowerCase() === 'jewellery';
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.compare_price,
            label: `${p.category} Premium`,
            category: isJewellery ? p.subcategory?.toLowerCase() : p.category?.toLowerCase() || '',
            gender: p.category?.toLowerCase() || '',
            type: p.subcategory?.toLowerCase() === 'lowers' ? 'lower' : (p.subcategory?.toLowerCase()?.includes('shirt') ? 'tshirt' : (p.subcategory?.toLowerCase() || 'tshirt')),
            sizes: p.sizes,
            description: p.description,
            frontImg: p.images?.[0] || '',
            backImg: p.images?.[1] || p.images?.[0] || '',
          };
        });
        setDbProducts(formatted);
      } catch (err) {
        console.error('Failed to fetch DB products', err);
      }
    };
    fetchDbProducts();
  }, [categoryFilter]);

  const dbMenProducts = dbProducts.filter((p: any) => p.gender === 'men');
  const dbWomenProducts = dbProducts.filter((p: any) => p.gender === 'women');
  const dbJewelleryProducts = dbProducts.filter((p: any) => p.gender === 'jewellery');

  const allWomenProducts = [...womenProducts, ...dbWomenProducts];
  const displayWomenProducts = categoryFilter === 'all' ? allWomenProducts.slice(0, 3) : allWomenProducts;
  const allJewelleryProducts = [...jewelleryProducts, ...dbJewelleryProducts];
  const displayJewelleryProducts = categoryFilter === 'all' ? allJewelleryProducts.slice(0, 3) : allJewelleryProducts;

  const openProduct = (product: any) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };
  return (
    <>
      <AnimatePresence mode="wait">
      {categoryFilter === 'men' && (
        <motion.section 
          key="men"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="men" 
          className="py-[120px] bg-[#12100C] relative z-10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              LATEST DROPS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              Men's Collection
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-[36px] items-center">
              {mensCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full md:w-[460px] max-w-[460px] group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1] uppercase">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          {dbMenProducts.length > 0 && (
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 mt-24">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-8 text-center md:text-left"
              >
                FROM OUR CATALOG
              </motion.h2>
              <div className="pinterest-grid">
                {dbMenProducts.map((item, i) => (
                  <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
                ))}
              </div>
            </div>
          )}
        </motion.section>
      )}
      {['men-tshirts', 'men-lowers', 'women-tshirts', 'women-lowers'].includes(categoryFilter) && (
        <motion.section 
          key="gendered-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="gendered-category" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              {categoryFilter.startsWith('men') ? "MEN'S COLLECTION" : "WOMEN'S COLLECTION"}
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter.startsWith('men') ? "MEN'S " : "WOMEN'S "}
              {categoryFilter.includes('tshirts') ? 'TSHIRTS' : 'LOWERS'}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            {((categoryFilter.startsWith('men') ? [...products, ...dbMenProducts] : allWomenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).length === 0 ? (
              <div className="w-full flex justify-center py-24">
                <h3 className="text-xl md:text-2xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1]/50 uppercase">
                  New Collection Coming Soon
                </h3>
              </div>
            ) : categoryFilter.startsWith('men') ? (
              <div className="pinterest-grid">
                {((categoryFilter.startsWith('men') ? [...products, ...dbMenProducts] : allWomenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).map((item, i) => (
                  <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
                ))}
              </div>
            ) : (
              <div className="pinterest-grid">
                {((categoryFilter.startsWith('men') ? [...products, ...dbMenProducts] : allWomenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).map((item, i) => (
                  <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
                ))}
              </div>
            )}
          </div>
        </motion.section>
      )}
      {categoryFilter === 'women' && (
        <motion.section 
          key="women"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="women" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              Women's Collection
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="flex flex-col md:flex-row flex-wrap justify-center gap-[36px] items-center">
              {womensCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="w-full md:w-[460px] max-w-[460px] group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1] uppercase">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {categoryFilter === 'accessories' && (
        <motion.section 
          key="accessories"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="accessories" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              ACCESSORIES COLLECTION
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 lg:gap-x-8 gap-y-16">
              {accessoriesCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 6) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    {item.id === 'toys' ? (
                      <div className="absolute inset-0 scale-[0.55] origin-center pointer-events-none">
                        <ComingSoon />
                      </div>
                    ) : (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className={`absolute inset-0 w-full h-full ${'fit' in item && item.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100`}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    {item.id !== 'toys' && <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />}
                    <div className="absolute inset-0 flex items-end justify-center pb-4">
                      <h3 className={`text-3xl font-archivo font-bold tracking-[0.2em] uppercase ${item.id === 'toys' ? 'text-[#FFE55A]' : 'text-[#EAE6E1]'}`}>
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {categoryFilter === 'jewellery' && (
        <motion.section 
          key="jewellery"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              JEWELLERY COLLECTION
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 lg:gap-x-8 gap-y-16">
              {jewelleryCategories.map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 6) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group relative flex flex-col cursor-pointer"
                  onClick={() => navigate(item.path)}
                >
                  {/* Antigravity & Glow Container */}
                  <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]" data-cursor-image>
                    
                    {/* Image with Zoom */}
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className={`absolute inset-0 w-full h-full ${'fit' in item && item.fit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100`}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    {/* Centered Text */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-2xl font-archivo font-bold tracking-[0.2em] text-[#EAE6E1] uppercase">
                        {item.name}
                      </h3>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {['rings', 'pendants', 'bracelet', 'earrings'].includes(categoryFilter) && (
        <motion.section 
          key="jewellery-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery-category" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              JEWELLERY
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="pinterest-grid">
              {allJewelleryProducts.filter(p => p.category === categoryFilter).map((item, i) => (
                <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
      {['keychain', 'toys'].includes(categoryFilter) && (
        <motion.section 
          key="accessories-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="accessories-category" 
          className="py-[120px] bg-[#12100C] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-plex-mono text-[#C5A059] mb-4 text-center md:text-left"
            >
              ACCESSORIES
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-archivo font-bold tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="pinterest-grid">
              {allJewelleryProducts.filter(p => p.category === categoryFilter).map((item, i) => (
                <PinterestCard key={item.id} product={item} index={i} onClick={() => openProduct(item)} />
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
    </>
  );
}