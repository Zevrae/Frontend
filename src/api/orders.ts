import api from './api';

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  product: string;
  name: string;
  price: number;
  size?: string;
  quantity: number;
  // Optional fields — present on custom-product order items
  category?: string;
  image?: string;           // primary product image (front design for custom orders)
  design_images?: string[]; // [frontUrl, backUrl?] if backend populates it
}

export interface Order {
  id: string;
  user: string | { id: string; name: string; email: string; phone?: string };
  items: OrderItem[];
  shipping_address: ShippingAddress;
  subtotal: number;
  shipping_fee: number;
  handling_fee: number;
  discount_code: string | null;
  discount_amount: number;
  total: number;
  payment_method: 'online' | 'cod';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  order_status: 'payment_pending' | 'placed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  // Estimated delivery date — defaults to 7 days after the order date on
  // the backend, but an admin can override it.
  expected_delivery_date?: string | null;
  // When the order was marked delivered — the 3-day exchange window starts here.
  delivered_at?: string | null;
  updated_at?: string;
  // Present once the customer has requested an exchange.
  exchange_request?: ExchangeRequest | null;
}

export interface ExchangeRequest {
  reason: string; // customer's suggestion / complaint
  item_indexes?: number[];
  status: 'requested' | 'approved' | 'rejected' | 'completed';
  requested_at: string;
}

export interface RazorpayPaymentInfo {
  provider: 'razorpay';
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
  payment: RazorpayPaymentInfo | null;
  message: string;
}

export const ordersApi = {
  create: async (payload: {
    shipping_address: ShippingAddress;
    payment_method: 'online' | 'cod';
    discount_code?: string;
  }): Promise<CreateOrderResponse> => {
    const response = await api.post('/orders', payload);
    return response.data;
  },

  list: async (params?: { page?: number; limit?: number; order_status?: string; payment_status?: string; payment_method?: string }) => {
    const response = await api.get('/orders', { params });
    return response.data as { success: boolean; data: Order[]; pagination: { page: number; limit: number; total: number; pages: number } };
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  // Self-serve cancellation — backend enforces the eligibility rules
  // (online-paid orders only, within 24 hours of placement).
  cancel: async (id: string): Promise<Order> => {
    const response = await api.post(`/orders/${id}/cancel`);
    return response.data.data;
  },

  // Exchange request — backend enforces the 3-day-after-delivery window.
  requestExchange: async (id: string, payload: { reason: string; item_indexes?: number[] }): Promise<Order> => {
    const response = await api.post(`/orders/${id}/exchange`, payload);
    return response.data.data;
  },

  updateStatus: async (id: string, updates: { order_status?: string; payment_status?: string; expected_delivery_date?: string | null }): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, updates);
    return response.data.data;
  },
};
