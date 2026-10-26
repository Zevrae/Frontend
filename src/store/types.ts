import type { ThemeName } from '../theme/themeConfig';
import type { WishlistProduct } from '../api/wishlist';

export interface Address {
  id?: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  is_default?: boolean;
}

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  addresses?: Address[];
  is_active: boolean;
  is_email_verified: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  image: string;
  category: string;
}

export type TransitionPhase = 'idle' | 'entering' | 'holding' | 'exiting';

export type { ThemeName, WishlistProduct };
