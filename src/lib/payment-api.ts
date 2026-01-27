// Payment & Subscription API
import { authenticatedApi, api } from './api';

export interface PricingProduct {
  product_key: string;
  product_name: string;
  base_price_usd: number;
  local_price_before_tax: number;
  tax_amount: number;
  final_price: number;
  currency: string;
  currency_symbol: string;
  display_price?: string;
  chart_limit?: number;
  daily_msg_limit?: number;
  hourly_msg_limit?: number | null;
  savings_percent?: number;
}

export interface PricingResponse {
  country_code: string;
  country_name: string;
  currency: string;
  tier: string;
  pricing: PricingProduct[];
  source: string;
  detected_at: string;
}

export interface SubscriptionStatus {
  has_active_subscription: boolean;
  plan_type: 'free' | 'weekly' | 'monthly' | 'premium';
  plan_name: string;
  valid_from: string | null;
  valid_until: string | null;
  days_remaining: number | null;
  auto_renew: boolean;
  limits: {
    charts: number;
    messages_daily: number;
    messages_hourly: number | null;
  };
}

export interface QuotaUsage {
  charts: {
    used: number;
    limit: number;
    remaining: number;
    reset_at: string | null;
  };
  messages: {
    used: number;
    limit: number;
    remaining: number;
    reset_at: string;
    period: 'daily';
  };
  messages_hourly: {
    used: number;
    limit: number | null;
    remaining: number | null;
    reset_at: string;
    period: 'hourly';
  } | null;
  messages_compat_hourly?: {
    used: number;
    limit: number | null;
    remaining: number | null;
    reset_at: string;
    period: 'hourly';
  } | null;
  messages_compat_daily?: {
    used: number;
    limit: number | null;
    remaining: number | null;
    reset_at: string;
    period: 'daily';
  } | null;
  promo_bonus?: {
    daily_messages: number;
    hourly_messages: number | null;  // null = unlimited hourly
    expires_at: string | null;
    source: string;  // The promo code used
  } | null;
}

export interface PaymentOrder {
  order_id: string;
  razorpay_order_id: string;
  razorpay_amount: number;
  currency: string;
  product_keys: string[];
  status: string;
  created_at: string;
}

export const paymentAPI = {
  // Get current pricing based on user's location (public endpoint)
  getPricing: (countryOverride?: string) =>
    api.get<PricingResponse>('/pricing/current', {
      params: {
        ...(countryOverride ? { country_override: countryOverride } : {}),
        _t: Date.now(), // Cache busting - force fresh response
      }
    }),

  // Create payment order
  createOrder: (productKeys: string[]) =>
    authenticatedApi.post<{ order: PaymentOrder }>('/payments/create-order', {
      product_keys: productKeys
    }),

  // Verify payment after Razorpay success
  verifyPayment: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) =>
    authenticatedApi.post<{ verified: boolean; order: PaymentOrder }>('/payments/verify', data),

  // Get order history
  getOrderHistory: (limit: number = 10) =>
    authenticatedApi.get<PaymentOrder[]>('/payments/orders', { params: { limit } }),

  // Get subscription status
  getSubscriptionStatus: () =>
    authenticatedApi.get<SubscriptionStatus>('/users/subscription'),

  // Get quota usage
  getQuotaUsage: () =>
    authenticatedApi.get<QuotaUsage>('/users/quota'),

  // Check payment status by session or payment ID
  checkPaymentStatus: (sessionId?: string, paymentId?: string) =>
    authenticatedApi.get<{ status: string }>('/payments/status', {
      params: {
        ...(sessionId ? { session_id: sessionId } : {}),
        ...(paymentId ? { payment_id: paymentId } : {}),
      }
    }),
};
