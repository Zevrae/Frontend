import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
const products = [
  {
    id: 'm17',
    name: 'CALSSIC LOWER',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'lower',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/svJ4xfzj/CALSSIC-LOWER-FRONT.jpg',
    backImg: 'https://i.ibb.co/ZR2LPZww/CALSSIC-LOWER-BACK.jpg',
    stock: 50
  },
  {
    id: 'm18',
    name: 'COZY LOWER',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'lower',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/rRk5vqXw/COZY-LOWER-FRONT.jpg',
    backImg: 'https://i.ibb.co/mCQMRH9K/COZY-LOWER-BACK.png',
    stock: 50
  },
  {
    id: 'm19',
    name: 'THE DRAGON LOWER',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'lower',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/RGyBrL7q/THE-DRAGON-LOWER-FRONT.jpg',
    stock: 50
  },
  {
    id: 'm6',
    name: 'CARNAGE',
    price: 799,
    originalPrice: 1599,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/k6VLyf0x/CARNAGE-FRONT.png',
    backImg: 'https://i.ibb.co/fdx9sHwf/CARNAGE-BACK.png',
    stock: 50
  },
  {
    id: 'm7',
    name: 'ANGEL DECENDED',
    price: 799,
    originalPrice: 1599,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/7Nx8TZ9g/ANGEL-DECENDED-FRONT.png',
    backImg: 'https://i.ibb.co/m511dxpz/ANGEL-DECENDED-BACK.png',
    stock: 50
  },
  {
    id: 'm8',
    name: 'THE MESS',
    price: 799,
    originalPrice: 1599,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/S7QZTyST/THE-MESS-FRONT.png',
    backImg: 'https://i.ibb.co/HQ3zzbB/THE-MESS-BACK.png',
    stock: 50
  },
  {
    id: 'm9',
    name: 'The Reposition',
    price: 799,
    originalPrice: 1599,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/Qvd0NTKD/The-Reposition-FRONT.png',
    backImg: 'https://i.ibb.co/RpN4NLPD/The-Reposition-BACK.png',
    stock: 50
  },
  {
    id: 'm10',
    name: 'OPTIMUS PRIME',
    price: 999,
    originalPrice: 1999,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/N20W7sm4/OPTIMUS-PRIME-FRONT.png',
    backImg: 'https://i.ibb.co/Y7DKs8j8/OPTIMUS-PRIME-BACK.png',
    stock: 50
  },
  {
    id: 'm11',
    name: 'VENOM SYMBIOTE',
    price: 999,
    originalPrice: 1999,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/tp5wTNhK/VENOM-SYMBIOTE-FRONT.png',
    backImg: 'https://i.ibb.co/9DRTRmr/VENOM-SYMBIOTE-BACK.png',
    stock: 50
  },
  {
    id: 'm12',
    name: 'LANA DEL RAY',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/N2ZHRYsb/LANA-DEL-RAY-FRONT.png',
    backImg: 'https://i.ibb.co/S4L2vLVk/LANA-DEL-RAY-BACK.png',
    stock: 50
  },
  {
    id: 'm13',
    name: 'MALBORO',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/1GKs96FH/MALBORO-FRONT.png',
    backImg: 'https://i.ibb.co/sJD7tz8y/MALBORO-BACK.png',
    stock: 50
  },
  {
    id: 'm14',
    name: 'THE WHITE MONSTER',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/PZvccJ85/THE-WHITE-MONSTER-FRONT.png',
    backImg: 'https://i.ibb.co/Nd0Z8DJw/THE-WHITE-MONSTER-BACK.png',
    stock: 50
  },
  {
    id: 'm15',
    name: 'THE SKULL',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/vCMq4kf1/THE-SKULL-FRONT.png',
    backImg: 'https://i.ibb.co/3qGJNwq/THE-SKULL-BACK.png',
    stock: 50
  },
  {
    id: 'm16',
    name: 'WEEKEND',
    price: 899,
    originalPrice: 1799,
    discount: '49% OFF',
    label: 'Men Premium',
    category: 'men',
    gender: 'men',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/VY5kC7PQ/WEEKEND-FRONT.png',
    backImg: 'https://i.ibb.co/k2g0sBn3/WEEKEND-BACK.png',
    stock: 50
  }
];
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
  { 
    id: 'w1', 
    name: 'FAST AND FURIOUS', 
    price: 399, 
    label: 'Women Premium', 
    category: 'women',
    gender: 'women',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/v4yYjxhm/FAST-AND-FURIOUS-BACK.png', 
  },
  { 
    id: 'w2', 
    name: 'LIGHTNING MCQUEEN BLACK', 
    price: 399, 
    label: 'Women Premium', 
    category: 'women',
    gender: 'women',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/21qqDjDv/LIGHTNING-MCQUEEN-BLACK.png', 
  },
  { 
    id: 'w3', 
    name: 'LIGHTNING MCQUEEN BLUE', 
    price: 399, 
    label: 'Women Premium', 
    category: 'women',
    gender: 'women',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/Q7DfTKPr/LIGHTNING-MCQUEEN-BLUE.png', 
  },
  { 
    id: 'w4', 
    name: 'LIGHTNING MCQUEEN SKIN', 
    price: 399, 
    label: 'Women Premium', 
    category: 'women',
    gender: 'women',
    type: 'tshirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    frontImg: 'https://i.ibb.co/gMYJmdFT/LIGHTNING-MCQUEEN-SKIN.png', 
  }
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
    id: 'keychain',
    name: 'KEYCHAIN',
    image: 'https://i.ibb.co/fdt5NJjf/Bright-Red-Metallic-Cherry-Keychain.png',
    fit: 'contain',
    path: '/jewellery/keychain'
  },
  {
    id: 'bracelet',
    name: 'BRACELET',
    image: 'https://i.ibb.co/4ZR90MKP/Gold-Year-of-Snake-Bracelet.png',
    fit: 'contain',
    path: '/jewellery/bracelet'
  },
  {
    id: 'toys',
    name: 'TOYS',
    image: 'https://i.ibb.co/SDxn1n3c/Cute-Sun-Moon-Plush-Doll.png',
    fit: 'contain',
    path: '/jewellery/toys'
  },
  {
    id: 'earrings',
    name: 'EARRINGS',
    image: 'https://i.ibb.co/y72Tgjg/Earing-set.png',
    fit: 'contain',
    path: '/jewellery/earrings'
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
    id: 'k1',
    name: "Bright Red Metallic Cherry Keychain",
    price: 399,
    originalPrice: 739,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/fdt5NJjf/Bright-Red-Metallic-Cherry-Keychain.png"
  },
  {
    id: 'k2',
    name: "Cartoon Honeycomb Bee Flower Alloy Keychain",
    price: 399,
    originalPrice: 739,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/j92T3rty/Cartoon-Bee-Flower-Alloy-Keychain-FRONT.png",
    backImg: "https://i.ibb.co/B2KkYnTp/Cartoon-Bee-Flower-Alloy-Keychain-BACK.png",
    topImg: "https://i.ibb.co/3YCMCyHz/Cartoon-Bee-Flower-Alloy-Keychain-TOP.png"
  },
  {
    id: 'k3',
    name: "Dagama Keychain",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/TqTFG273/Dagama-Keychain.png"
  },
  {
    id: 'k4',
    name: "Drill Alloy Sunflower Lightning Cross",
    price: 399,
    originalPrice: 799,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/J9yQpG7/Drill-Alloy-Sunflower-Lightning-Cross-FRONT.png",
    backImg: "https://i.ibb.co/mVpsm12p/Drill-Alloy-Sunflower-Lightning-Cross-BACK.jpg"
  },
  {
    id: 'k5',
    name: "Flamenco Keychain",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/3yQzs211/Flamenco-Keychain.png"
  },
  {
    id: 'k6',
    name: "Gremio Keychain",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/B2rJ7P14/Gremio-Keychain.png"
  },
  {
    id: 'k7',
    name: "Intelligence National Team Keychain",
    price: 259,
    originalPrice: 479,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/gZtnPYRR/Intelligence-National-Team-Keychain.png"
  },
  {
    id: 'k8',
    name: "Pastoral Flower Alloy Keychain",
    price: 399,
    originalPrice: 739,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/rKnpDFX6/Pastoral-Flower-Alloy-Keychain-FRONT.png",
    backImg: "https://i.ibb.co/BH94y86h/Pastoral-Flower-Alloy-Keychain-BACK.png"
  },
  {
    id: 'k9',
    name: "Rainbow Love Set Keychain",
    price: 499,
    originalPrice: 839,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/7txCwS26/Rainbow-Love-Set-Keychain.png"
  },
  {
    id: 'k10',
    name: "Rainbow Unicorn Set Keychain",
    price: 499,
    originalPrice: 839,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/vxXCHrJz/Rainbow-Unicorn-Set-Keychain.png"
  },
  {
    id: 'k11',
    name: "Red Cherry Keychain",
    price: 499,
    originalPrice: 839,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/hFWYWn0P/Red-Cherry-Keychain.png"
  },
  {
    id: 'k12',
    name: "Red Love Keychain",
    price: 499,
    originalPrice: 839,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/HLsFXm8q/Red-Love-Keychain.png"
  },
  {
    id: 'k13',
    name: "Silver Skeleton Hand Heart Keychain",
    price: 499,
    originalPrice: 839,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/FRsjTs2/Silver-Skeleton-Hand-Heart-Keychain.png"
  },
  {
    id: 'k14',
    name: "Silver Spider Web Keychain",
    price: 699,
    originalPrice: 1294,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/WpPrR18m/Silver-Spider-Web-Keychain.png"
  },
  {
    id: 'k15',
    name: "Starfish Keychain",
    price: 499,
    originalPrice: 839,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/Df7dkNxq/Starfish-Keychain.png"
  },
  {
    id: 'k16',
    name: "Vintage Medieval Anchor Keychain Accessory Streetwear",
    price: 399,
    originalPrice: 739,
    discount: "46% OFF",
    category: "keychain",
    label: 'Jewellery Premium',
    sizes: ["Universal"],
    frontImg: "https://i.ibb.co/zVPbsrnJ/Vintage-Medieval-Anchor-Keychain-Accessory-Streetwear-FRONT.png",
    backImg: "https://i.ibb.co/chytnnW0/Vintage-Medieval-Anchor-Keychain-Accessory-Streetwear-BACK.png"
  },
  { 
    id: 't1', 
    name: 'Cute Sun Moon Plush Doll', 
    price: 899,
    originalPrice: 1665,
    discount: "46% OFF",
    label: 'Toys Premium', 
    category: 'toys',
    sizes: ['Universal'],
    frontImg: 'https://i.ibb.co/SDxn1n3c/Cute-Sun-Moon-Plush-Doll.png', 
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
export default function ProductGrid({ categoryFilter = 'all' }: { categoryFilter?: 'all' | 'men' | 'women' | 'jewellery' | 'rings' | 'pendants' | 'keychain' | 'bracelet' | 'toys' | 'earrings' | 'men-tshirts' | 'men-lowers' | 'women-tshirts' | 'women-lowers' }) {
  const navigate = useNavigate();
  const displayWomenProducts = categoryFilter === 'all' ? womenProducts.slice(0, 3) : womenProducts;
  const displayJewelleryProducts = categoryFilter === 'all' ? jewelleryProducts.slice(0, 3) : jewelleryProducts;
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
          className="py-[120px] bg-[#0a0a0a] relative z-10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-serif text-[#C5A059] mb-4 text-center md:text-left"
            >
              LATEST DROPS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-serif font-light tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
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
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]">
                    
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-serif font-light tracking-[0.2em] text-[#EAE6E1] uppercase">
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
      {['men-tshirts', 'men-lowers', 'women-tshirts', 'women-lowers'].includes(categoryFilter) && (
        <motion.section 
          key="gendered-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="gendered-category" 
          className="py-[120px] bg-[#0a0a0a] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-serif text-[#C5A059] mb-4 text-center md:text-left"
            >
              {categoryFilter.startsWith('men') ? "MEN'S COLLECTION" : "WOMEN'S COLLECTION"}
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-serif font-light tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter.startsWith('men') ? "MEN'S " : "WOMEN'S "}
              {categoryFilter.includes('tshirts') ? 'TSHIRTS' : 'LOWERS'}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            {((categoryFilter.startsWith('men') ? products : womenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).length === 0 ? (
              <div className="w-full flex justify-center py-24">
                <h3 className="text-xl md:text-2xl font-serif tracking-[0.2em] text-[#EAE6E1]/50 uppercase">
                  New Collection Coming Soon
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {((categoryFilter.startsWith('men') ? products : womenProducts)).filter(p => p.gender === (categoryFilter.startsWith('men') ? 'men' : 'women') && p.type === (categoryFilter.includes('tshirts') ? 'tshirt' : 'lower')).map((item, i) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    className="group relative flex flex-col cursor-pointer"
                    onClick={() => openProduct(item)}
                  >
                    <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]">
                      
                      {item.frontImg ? (
                        <img 
                          src={item.frontImg} 
                          alt={item.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[#EAE6E1]/20 font-serif tracking-widest uppercase text-xs">
                          Image Pending
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-[#EAE6E1]/10 px-3 py-1.5 rounded-full z-10">
                        <span className="text-[9px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/80">
                          {item.label}
                        </span>
                      </div>
                      {/* Discount Badge */}
                      {('discount' in item && item.discount) && (
                        <div className="absolute top-4 right-4 bg-[#C5A059] px-2 py-1 rounded-sm shadow-lg z-10">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#0a0a0a]">
                            {item.discount}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                        <button className="w-full bg-[#EAE6E1] text-[#0a0a0a] py-3 flex items-center justify-center space-x-2 hover:bg-[#C5A059] transition-colors duration-300 rounded-sm">
                          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Quick View</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 px-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif font-medium text-[13px] tracking-[0.1em] text-[#EAE6E1] group-hover:text-[#C5A059] transition-colors duration-300 uppercase leading-tight pr-4">
                          {item.name}
                        </h3>
                        <div className="flex flex-col items-end">
                          <span className="text-[13px] font-mono tracking-wider text-[#EAE6E1]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}</span>
                          {('originalPrice' in item && item.originalPrice) && (
                            <span className="text-[10px] font-mono tracking-wider text-[#EAE6E1]/50 line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.originalPrice as number)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
          className="py-[120px] bg-[#0a0a0a] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-serif text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-serif font-light tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
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
                  <div className="relative w-full aspect-[3/4] min-h-[540px] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]">
                    
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                      referrerPolicy="no-referrer"
                    />
                    
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-3xl font-serif font-light tracking-[0.2em] text-[#EAE6E1] uppercase">
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
          className="py-[120px] bg-[#0a0a0a] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-serif text-[#C5A059] mb-4 text-center md:text-left"
            >
              NEW ARRIVALS
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-serif font-light tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
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
                  <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]">
                    
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
                      <h3 className="text-2xl font-serif font-light tracking-[0.2em] text-[#EAE6E1] uppercase">
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
      {['rings', 'pendants', 'keychain', 'bracelet', 'toys', 'earrings'].includes(categoryFilter) && (
        <motion.section 
          key="jewellery-category"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          id="jewellery-category" 
          className="py-[120px] bg-[#0a0a0a] relative z-10 border-t border-[#C5A059]/10"
        >
          <div className="max-w-[1400px] mx-auto px-6 md:px-12 mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-[12px] uppercase tracking-[0.4em] font-serif text-[#C5A059] mb-4 text-center md:text-left"
            >
              JEWELLERY
            </motion.h2>
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-3xl md:text-5xl font-serif font-light tracking-[0.1em] text-[#EAE6E1] text-center md:text-left uppercase"
            >
              {categoryFilter}
            </motion.h3>
          </div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {jewelleryProducts.filter(p => p.category === categoryFilter).map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group relative flex flex-col cursor-pointer"
                  onClick={() => openProduct(item)}
                >
                  {/* Antigravity & Glow Container */}
                  <div className="relative aspect-[3/4] mb-6 bg-[#111111] rounded-sm overflow-hidden transition-all duration-500 ease-out group-hover:-translate-y-3 group-hover:shadow-[0_10px_40px_-10px_rgba(197,160,89,0.25)]">
                    
                    {/* Image with Zoom */}
                    {item.frontImg ? (
                      <img 
                        src={item.frontImg} 
                        alt={item.name} 
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-90 group-hover:opacity-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center text-[#EAE6E1]/20 font-serif tracking-widest uppercase text-xs">
                        Image Pending
                      </div>
                    )}
                    
                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Category Label Badge */}
                    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-[#EAE6E1]/10 px-3 py-1.5 rounded-full z-10">
                      <span className="text-[9px] uppercase tracking-[0.2em] font-serif text-[#EAE6E1]/80">
                        {item.label}
                      </span>
                    </div>
                    {/* Discount Badge */}
                    {('discount' in item && item.discount) && (
                      <div className="absolute top-4 right-4 bg-[#C5A059] px-2 py-1 rounded-sm shadow-lg z-10">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#0a0a0a]">
                          {item.discount}
                        </span>
                      </div>
                    )}
                    {/* Quick View Button (Appears on Hover) */}
                    <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProduct(item);
                        }}
                        className="w-full bg-[#EAE6E1] text-[#0a0a0a] py-3 flex items-center justify-center space-x-2 hover:bg-[#C5A059] transition-colors duration-300 rounded-sm"
                      >
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Quick View</span>
                      </button>
                    </div>
                  </div>
                  {/* Product Info */}
                  <div className="flex flex-col space-y-2 px-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-serif font-medium text-[13px] tracking-[0.1em] text-[#EAE6E1] group-hover:text-[#C5A059] transition-colors duration-300 uppercase leading-tight pr-4">
                        {item.name}
                      </h3>
                      <div className="flex flex-col items-end">
                        <span className="text-[13px] font-mono tracking-wider text-[#EAE6E1]">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}</span>
                        {('originalPrice' in item && item.originalPrice) && (
                          <span className="text-[10px] font-mono tracking-wider text-[#EAE6E1]/50 line-through">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.originalPrice as number)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
    </>
  );
}