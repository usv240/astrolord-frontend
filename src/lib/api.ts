import axios, { AxiosInstance } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Base axios instance for public endpoints
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authenticated axios instance
export const authenticatedApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to authenticated requests
authenticatedApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle authentication errors
authenticatedApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (email: string, password: string, name?: string) =>
    api.post('/auth/register', { email, password, name }),

  verifyEmail: (email: string, otp: string) =>
    api.post('/auth/verify-email', { email, otp }),

  resendOtp: (email: string) =>
    api.post('/auth/resend-otp', { email }),

  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  refreshToken: (refresh_token: string) =>
    api.post('/auth/refresh', { refresh_token }),

  getMe: () => authenticatedApi.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, new_password: string) =>
    api.post('/auth/reset-password', { token, new_password }),

  updateProfile: (data: { name?: string; email_preferences?: boolean }) =>
    authenticatedApi.put('/auth/profile', data),

  changePassword: (current_password: string, new_password: string) =>
    authenticatedApi.put('/auth/password', { current_password, new_password }),

  deleteAccount: () =>
    authenticatedApi.delete('/auth/account'),
};

// Chart API calls
export const chartAPI = {
  createChart: (data: {
    name?: string;
    gender?: string;
    dob: string;
    time: string;
    location: {
      city?: string;
      lat?: number;
      lon?: number;
      tz?: string;
    };
    options?: {
      includeAshtakavarga?: boolean;
      layout?: 'north' | 'south';
    };
  }, system: string = 'vedic') =>
    authenticatedApi.post(`/api/chart?system=${system}`, data),

  getMyCharts: (limit: number = 25) =>
    authenticatedApi.get(`/api/my/charts?limit=${limit}`),

  getMyChart: (chartId: string) =>
    authenticatedApi.get(`/api/my/charts/${chartId}`),

  deleteChart: (chartId: string) =>
    authenticatedApi.delete(`/api/my/charts/${chartId}`),

  getChartBundle: (
    key: string,
    divisionalTypes: string = 'D9,D10',
    includeDashas: boolean = true
  ) =>
    authenticatedApi.get(`/api/chart-bundle/${key}`, {
      params: { divisional_types: divisionalTypes, include_dashas: includeDashas },
    }),

  getDashas: (key: string, refresh: boolean = false) =>
    authenticatedApi.get(`/api/dashas/${key}`, { params: { refresh } }),

  getDivisional: (key: string, dtype: string) =>
    authenticatedApi.get(`/api/divisionals/${key}/${dtype}`),

  searchCities: (query: string) =>
    api.get(`/api/geo/search?q=${query}`),
};

// Transits API calls
export const transitsAPI = {
  getDailyTransits: (chartId?: string, date?: string, tz?: string) =>
    authenticatedApi.get('/transits/daily', { params: { chart_id: chartId, date, tz } }),

  chat: (chartId?: string, message?: string, date?: string, tz?: string, skipIntro?: boolean) =>
    authenticatedApi.post('/transits/chat', { chart_id: chartId, message, date, tz, skip_intro: skipIntro })
};

// AI API calls
export const aiAPI = {
  createSession: (chartId: string) =>
    authenticatedApi.post('/ai/session', { chart_id: chartId }),

  listSessions: () =>
    authenticatedApi.get('/ai/sessions'),

  updateSession: (sessionId: string, data: { title?: string; is_deleted?: boolean }) =>
    authenticatedApi.patch(`/ai/session/${sessionId}`, data),

  getSessionHistory: (sessionId: string, skip: number, limit: number) =>
    authenticatedApi.get(`/ai/session/${sessionId}/history`, { params: { skip, limit } }),

  chat: (
    message: string,
    sessionId?: string,
    model?: string,
    systemPrompt?: string,
    promptId?: string,
    includeExamples: boolean = false,
    focus?: string
  ) =>
    authenticatedApi.post('/ai/chat', {
      message,
      session_id: sessionId,
      model,
      system_prompt: systemPrompt,
      prompt_id: promptId,
      include_examples: includeExamples,
      focus,
    }),

  submitFeedback: (messageId: string, sessionId: string, score: number, comment?: string) =>
    authenticatedApi.post('/ai/feedback', {
      message_id: messageId,
      session_id: sessionId,
      score,
      comment,
    }),
};

// Admin API calls
export const adminAPI = {
  getStats: (days: number = 7) =>
    authenticatedApi.get('/admin/stats', { params: { days } }),

  getQueries: (limit: number = 50) =>
    authenticatedApi.get('/admin/queries', { params: { limit } }),

  getFeedback: (limit: number = 50) =>
    authenticatedApi.get('/admin/feedback', { params: { limit } }),

  getGeneralFeedback: (limit: number = 50) =>
    authenticatedApi.get('/feedback/', { params: { limit } }),

  getUsers: (limit: number = 100, skip: number = 0) =>
    authenticatedApi.get('/admin/users', { params: { limit, skip } }),

  getUserDetails: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}`),

  getUserCharts: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}/charts`),

  getUserSessions: (userId: string) =>
    authenticatedApi.get(`/admin/users/${userId}/sessions`),

  // Analytics endpoints
  getAnalyticsDashboard: (days: number = 30) =>
    authenticatedApi.get('/admin/analytics/dashboard', { params: { days } }),

  getAnalyticsIntents: (days: number = 30) =>
    authenticatedApi.get('/admin/analytics/intents', { params: { days } }),

  getAnalyticsEmotionalTone: (days: number = 30) =>
    authenticatedApi.get('/admin/analytics/emotional-tone', { params: { days } }),

  getAnalyticsResponseQuality: (days: number = 30) =>
    authenticatedApi.get('/admin/analytics/response-quality', { params: { days } }),

  getAnalyticsRemedies: (days: number = 30) =>
    authenticatedApi.get('/admin/analytics/phase2/remedies', { params: { days } }),

  getAnalyticsCharts: (days: number = 30) =>
    authenticatedApi.get('/admin/analytics/phase2/charts', { params: { days } }),
};

// Relationship API calls
export const relationshipAPI = {
  match: (data: {
    p1: { name: string; dob: string; time: string; city: string; lat?: number; lon?: number; tz?: string };
    p2: { name: string; dob: string; time: string; city: string; lat?: number; lon?: number; tz?: string };
    context?: string;
  }) => {
    // Transform frontend data to backend structure
    const payload = {
      female: {
        name: data.p1.name,
        dob: data.p1.dob,
        time: data.p1.time,
        location: data.p1.city,
        lat: data.p1.lat,
        lon: data.p1.lon,
        tz: data.p1.tz
      },
      male: {
        name: data.p2.name,
        dob: data.p2.dob,
        time: data.p2.time,
        location: data.p2.city,
        lat: data.p2.lat,
        lon: data.p2.lon,
        tz: data.p2.tz
      }
    };
    return authenticatedApi.post('/matchmaking/calculate', payload);
  },

  matchWithScore: (data: {
    p1: { name: string; dob: string; time: string; city: string; lat?: number; lon?: number; tz?: string };
    p2: { name: string; dob: string; time: string; city: string; lat?: number; lon?: number; tz?: string };
    context?: string;
  }) => {
    // Transform frontend data to backend structure
    const payload = {
      female: {
        name: data.p1.name,
        dob: data.p1.dob,
        time: data.p1.time,
        location: data.p1.city,
        lat: data.p1.lat,
        lon: data.p1.lon,
        tz: data.p1.tz
      },
      male: {
        name: data.p2.name,
        dob: data.p2.dob,
        time: data.p2.time,
        location: data.p2.city,
        lat: data.p2.lat,
        lon: data.p2.lon,
        tz: data.p2.tz
      }
    };
    return authenticatedApi.post('/matchmaking/score', payload);
  },

  chat: (data: {
    match_id?: string;
    p1_name?: string;
    p2_name?: string;
    p1_details?: string;
    p2_details?: string;
    score?: number;
    message: string;
    history: { role: string; content: string }[];
  }) => authenticatedApi.post('/matchmaking/chat', data),

  listMatches: () => authenticatedApi.get('/matchmaking/list'),
  getMatch: (id: string) => authenticatedApi.get(`/matchmaking/${id}`),
  deleteMatch: (id: string) => authenticatedApi.delete(`/matchmaking/${id}`),
};

// Notification API calls
export const notificationAPI = {
  // Register FCM token with backend
  registerToken: (token: string, deviceInfo?: object) =>
    authenticatedApi.post('/notifications/register-token', { token, device_info: deviceInfo }),

  // Get notification preferences
  getPreferences: () =>
    authenticatedApi.get('/notifications/preferences'),

  // Update notification preferences
  updatePreferences: (preferences: object) =>
    authenticatedApi.put('/notifications/preferences', preferences),

  // Disable all notifications
  disableNotifications: () =>
    authenticatedApi.delete('/notifications/token'),

  // Send test notification
  testNotification: (type: string = 'daily_forecast', chartId?: string) =>
    authenticatedApi.post('/notifications/test', { notification_type: type, chart_id: chartId }),
};

export const feedbackAPI = {
  submit: (data: { rating: number; category: string; comment?: string; email?: string }) =>
    authenticatedApi.post('/feedback/', data),
};

// Promo Code API calls
export const promoAPI = {
  // Validate a promo code (check if valid without redeeming)
  validate: (code: string) =>
    authenticatedApi.get(`/promo/validate/${code}`),

  // Redeem a promo code
  redeem: (code: string) =>
    authenticatedApi.post('/promo/redeem', { code }),
};

// Quota API calls (public - no auth required)
export const quotaAPI = {
  // Get all plan quotas (for pricing pages)
  getPlans: () => api.get('/api/quota/plans'),

  // Get specific plan quota
  getPlan: (planKey: string) => api.get(`/api/quota/plans/${planKey}`),
};
