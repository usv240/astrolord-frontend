/**
 * Admin API Client
 * Handles all admin dashboard API requests to the backend
 */

import { authenticatedApi } from './api';

const adminAPI = {
  // Dashboard Endpoints
  getDashboardOverview: (days: number = 7) =>
    authenticatedApi.get(`/admin/dashboard/overview?days=${days}`),

  getDashboardCharts: (days: number = 30) =>
    authenticatedApi.get(`/admin/dashboard/charts?days=${days}`),

  getRecentActivity: (limit: number = 20) =>
    authenticatedApi.get(`/admin/dashboard/recent-activity?limit=${limit}`),

  // Payment Endpoints
  getPaymentOverview: (days: number = 30) =>
    authenticatedApi.get(`/admin/payments/overview?days=${days}`),

  getTransactions: (status?: string, limit: number = 50, skip: number = 0) => {
    let url = `/admin/payments/transactions?limit=${limit}&skip=${skip}`;
    if (status) url += `&status=${status}`;
    return authenticatedApi.get(url);
  },

  getSubscriptions: (status?: string, limit: number = 50, skip: number = 0) => {
    let url = `/admin/payments/subscriptions?limit=${limit}&skip=${skip}`;
    if (status) url += `&status=${status}`;
    return authenticatedApi.get(url);
  },

  getRevenueChart: (days: number = 30) =>
    authenticatedApi.get(`/admin/payments/revenue-chart?days=${days}`),

  extendSubscription: (userId: string, days: number) =>
    authenticatedApi.post(`/admin/payments/subscriptions/${userId}/extend?days=${days}`),

  grantSubscription: (userId: string, planType: string, reason?: string) =>
    authenticatedApi.post(`/admin/payments/subscriptions/${userId}/grant`, {
      plan_type: planType,
      reason: reason || null,
    }),

  revokeSubscription: (userId: string) =>
    authenticatedApi.delete(`/admin/payments/subscriptions/${userId}/revoke`),

  // System Health Endpoints
  getSystemHealth: () =>
    authenticatedApi.get(`/admin/system/health`),

  getErrorLogs: (hours: number = 24, limit: number = 50) =>
    authenticatedApi.get(`/admin/system/errors?hours=${hours}&limit=${limit}`),

  getPerformanceMetrics: (days: number = 7) =>
    authenticatedApi.get(`/admin/system/performance?days=${days}`),

  getDatabaseStats: () =>
    authenticatedApi.get(`/admin/system/database-stats`),

  // Moderation Endpoints
  getFeedbackForReview: (rating?: number, category?: string, limit: number = 50, skip: number = 0) => {
    let url = `/admin/moderation/feedback/review?limit=${limit}&skip=${skip}`;
    if (rating) url += `&rating=${rating}`;
    if (category) url += `&category=${category}`;
    return authenticatedApi.get(url);
  },

  moderateFeedback: (feedbackId: string, action: string, reason: string, notes?: string) =>
    authenticatedApi.post(`/admin/moderation/feedback/${feedbackId}/moderate`, {
      action,
      reason,
      notes,
    }),

  getFlaggedQueries: (limit: number = 50) =>
    authenticatedApi.get(`/admin/moderation/queries/flagged?limit=${limit}`),

  getSuspiciousUsers: (reason?: string, limit: number = 50) => {
    let url = `/admin/moderation/users/suspicious?limit=${limit}`;
    if (reason) url += `&reason=${reason}`;
    return authenticatedApi.get(url);
  },

  moderateUser: (userId: string, action: string, reason: string, notes?: string) =>
    authenticatedApi.post(`/admin/moderation/users/${userId}/moderate`, {
      action,
      reason,
      notes,
    }),

  getModerationAuditLog: (days: number = 30, moderatorEmail?: string, limit: number = 100) => {
    let url = `/admin/moderation/audit-log?days=${days}&limit=${limit}`;
    if (moderatorEmail) url += `&moderator_email=${moderatorEmail}`;
    return authenticatedApi.get(url);
  },

  requestUserFeedback: (userId: string, customMessage?: string) =>
    authenticatedApi.post(`/admin/moderation/users/${userId}/request-feedback`, {
      custom_message: customMessage || null,
    }),

  bulkRequestFeedback: (userIds: string[], customMessage?: string) =>
    authenticatedApi.post(`/admin/moderation/users/bulk-request-feedback`, {
      user_ids: userIds,
      custom_message: customMessage || null,
    }),

  requestFeedbackAllUsers: (customMessage?: string) =>
    authenticatedApi.post(`/admin/moderation/users/request-feedback-all`, {
      custom_message: customMessage || null,
    }),

  // User Management Endpoints
  getUsers: (limit: number = 100, skip: number = 0) =>
    authenticatedApi.get(`/admin/users?limit=${limit}&skip=${skip}`),

  getUserDetails: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}`),

  getUserCharts: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}/charts`),

  getUserSessions: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}/sessions`),

  getChartSessions: (userId: string, chartId: string) =>
    authenticatedApi.get(`/admin/users/${userId}/charts/${chartId}/sessions`),

  getUserConversations: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}/conversations`),

  getConversationMessages: (sessionId: string) =>
    authenticatedApi.get(`/admin/conversations/${sessionId}/messages`),

  // Analytics Endpoints
  getAnalyticsDashboard: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/dashboard?days=${days}`),

  getIntentMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/intents?days=${days}`),

  getFocusModeMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/focus-modes?days=${days}`),

  getSessionMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/sessions?days=${days}`),

  getEmotionalToneMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/emotional-tone?days=${days}`),

  getResponseQualityMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/response-quality?days=${days}`),

  // Phase 2 Analytics
  getRemedyAnalytics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/phase2/remedies?days=${days}`),

  getChartAnalytics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/phase2/charts?days=${days}`),

  getRetentionAnalytics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/phase2/retention?days=${days}`),

  // Phase 3 Analytics
  getUserLifecycleMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/phase3/user-lifecycle?days=${days}`),

  getChartCreationMetrics: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/phase3/chart-creation?days=${days}`),

  getOnboardingFunnel: (days: number = 30) =>
    authenticatedApi.get(`/admin/analytics/phase3/onboarding?days=${days}`),

  // Promo Code Endpoints
  getPromoCodes: (includeInactive: boolean = false) =>
    authenticatedApi.get(`/admin/promo/codes?include_inactive=${includeInactive}`),

  getPromoCodeDetails: (code: string) =>
    authenticatedApi.get(`/admin/promo/codes/${encodeURIComponent(code)}`),

  createPromoCode: (data: {
    code: string;
    description: string;
    reward_type: 'subscription' | 'bonus_messages';
    subscription_config?: { plan_type: string; duration_days?: number };
    bonus_messages_config?: { bonus_messages: number; bonus_hourly?: number | null; bonus_duration_days: number };
    max_uses?: number | null;
    max_uses_per_user?: number;
    valid_from?: string;
    valid_until?: string;
    target_plans?: string[] | null;
  }) => authenticatedApi.post('/admin/promo/codes', data),

  updatePromoCode: (code: string, updates: {
    description?: string;
    max_uses?: number | null;
    max_uses_per_user?: number;
    valid_until?: string;
    is_active?: boolean;
    target_plans?: string[] | null;
  }) => authenticatedApi.put(`/admin/promo/codes/${encodeURIComponent(code)}`, updates),

  deactivatePromoCode: (code: string) =>
    authenticatedApi.delete(`/admin/promo/codes/${encodeURIComponent(code)}`),

  getPromoRedemptions: (code?: string, limit: number = 50) => {
    let url = `/admin/promo/redemptions?limit=${limit}`;
    if (code) url += `&code=${encodeURIComponent(code)}`;
    return authenticatedApi.get(url);
  },

  // Pricing Management Endpoints
  getPricingProducts: () =>
    authenticatedApi.get('/admin/pricing/products'),

  updatePricingProduct: (productKey: string, data: {
    name?: string;
    base_price_usd?: number;
    description?: string;
    active?: boolean;
  }) => authenticatedApi.put(`/admin/pricing/products/${productKey}`, data),

  getPricingCountries: () =>
    authenticatedApi.get('/admin/pricing/countries'),

  addPricingCountry: (data: {
    country_code: string;
    country_name: string;
    currency: string;
    tier: string;
    price_multiplier: number;
    tax_rate?: number;
    tax_name?: string;
  }) => authenticatedApi.post('/admin/pricing/countries', data),

  updatePricingCountry: (countryCode: string, data: {
    country_name?: string;
    currency?: string;
    tier?: string;
    price_multiplier?: number;
    tax_rate?: number;
    tax_name?: string;
    active?: boolean;
  }) => authenticatedApi.put(`/admin/pricing/countries/${countryCode}`, data),

  getPricingTiers: () =>
    authenticatedApi.get('/admin/pricing/tiers'),

  updatePricingTier: (tierId: string, multiplier: number) =>
    authenticatedApi.put(`/admin/pricing/tiers/${tierId}`, { multiplier }),

  previewPricing: (countryCode: string) =>
    authenticatedApi.get(`/admin/pricing/preview/${countryCode}`),

  invalidatePricingCache: () =>
    authenticatedApi.post('/admin/pricing/cache/invalidate'),

  // Price Overrides - Set fixed prices per product per country
  getPricingOverrides: () =>
    authenticatedApi.get('/admin/pricing/overrides'),

  setPricingOverride: (data: {
    product_key: string;
    country_code: string;
    price: number;
    reason?: string;
  }) => authenticatedApi.post('/admin/pricing/overrides', data),

  deletePricingOverride: (productKey: string, countryCode: string) =>
    authenticatedApi.delete(`/admin/pricing/overrides/${productKey}/${countryCode}`),

  // Email Management Endpoints
  getEmailStatus: () =>
    authenticatedApi.get('/admin/email/status'),

  resendWelcomeEmail: (userId: string) =>
    authenticatedApi.post(`/admin/email/resend/${userId}`),

  resendAllWelcomeEmails: () =>
    authenticatedApi.post('/admin/email/resend-all'),
};

export default adminAPI;
