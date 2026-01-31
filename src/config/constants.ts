/**
 * Application Constants
 * 
 * Centralized configuration for magic numbers, durations, limits, and other constants.
 * This makes the codebase easier to maintain and adjust.
 */

// ============================================================================
// TIME & DURATION CONSTANTS (in milliseconds unless specified)
// ============================================================================

export const DURATIONS = {
  /** Animation durations */
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
  
  /** Debounce delays */
  DEBOUNCE_SEARCH: 300,
  DEBOUNCE_FORM_SAVE: 500,
  DEBOUNCE_RESIZE: 100,
  
  /** Toast display duration */
  TOAST_DEFAULT: 5000,
  TOAST_ERROR: 7000,
  TOAST_SUCCESS: 3000,
  
  /** Undo action timeout */
  UNDO_TIMEOUT: 5000,
  
  /** Session timeouts */
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  TOKEN_REFRESH_INTERVAL: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// POLLING INTERVALS
// ============================================================================

export const POLLING = {
  /** Subscription status refresh interval */
  SUBSCRIPTION_STATUS: 5 * 60 * 1000, // 5 minutes
  
  /** Admin dashboard live stats polling */
  LIVE_STATS: 5000, // 5 seconds
  
  /** Chat session polling (if needed) */
  CHAT_UPDATES: 3000, // 3 seconds
  
  /** Online status check */
  ONLINE_STATUS: 30 * 1000, // 30 seconds
} as const;

// ============================================================================
// CACHE SETTINGS (for React Query)
// ============================================================================

export const CACHE = {
  /** Standard stale time (5 minutes) */
  STALE_TIME: 5 * 60 * 1000,
  
  /** Garbage collection time (30 minutes) */
  GC_TIME: 30 * 60 * 1000,
  
  /** Short-lived data (1 minute) */
  STALE_TIME_SHORT: 60 * 1000,
  
  /** Long-lived data (1 hour) */
  STALE_TIME_LONG: 60 * 60 * 1000,
} as const;

// ============================================================================
// UI LIMITS
// ============================================================================

export const LIMITS = {
  /** Maximum characters in chat message */
  CHAT_MESSAGE_MAX: 2000,
  
  /** Maximum characters in chart name */
  CHART_NAME_MAX: 100,
  
  /** Maximum search results to display */
  SEARCH_RESULTS_MAX: 20,
  
  /** Items per page for pagination */
  PAGE_SIZE_DEFAULT: 20,
  PAGE_SIZE_SMALL: 10,
  PAGE_SIZE_LARGE: 50,
  
  /** Maximum file upload size (in bytes) */
  FILE_UPLOAD_MAX: 5 * 1024 * 1024, // 5MB
  
  /** Maximum charts in favorites */
  FAVORITES_MAX: 10,
  
  /** Log buffer size */
  LOG_BUFFER_SIZE: 100,
} as const;

// ============================================================================
// API RETRY SETTINGS
// ============================================================================

export const API = {
  /** Maximum retry attempts */
  RETRY_COUNT: 3,
  
  /** Base delay between retries (exponential backoff) */
  RETRY_DELAY: 1000,
  
  /** Request timeout */
  REQUEST_TIMEOUT: 30000, // 30 seconds
  
  /** Upload timeout (longer for file uploads) */
  UPLOAD_TIMEOUT: 60000, // 60 seconds
} as const;

// ============================================================================
// RATE LIMITING (for UI feedback)
// ============================================================================

export const RATE_LIMITS = {
  /** Minimum delay between chat messages */
  CHAT_MESSAGE_DELAY: 1000, // 1 second
  
  /** Cooldown after hitting rate limit */
  RATE_LIMIT_COOLDOWN: 60 * 1000, // 1 minute
} as const;

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  /** Authentication token */
  AUTH_TOKEN: 'authToken',
  
  /** User data */
  USER: 'user',
  
  /** Theme preference */
  THEME: 'astrolord-theme',
  
  /** Onboarding completion */
  ONBOARDING_COMPLETE: 'onboarding_complete',
  
  /** Cookie consent */
  COOKIE_CONSENT: 'cookie_consent',
  
  /** Draft forms prefix */
  DRAFT_PREFIX: 'draft_',
  
  /** Favorites */
  FAVORITES: 'chart_favorites',
  
  /** Frontend logs */
  FRONTEND_LOGS: 'frontend_logs',
  
  /** Last seen version (for changelog) */
  LAST_SEEN_VERSION: 'last_seen_version',
} as const;

// ============================================================================
// BREAKPOINTS (matching Tailwind defaults)
// ============================================================================

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// ============================================================================
// COLORS (for programmatic use)
// ============================================================================

export const COLORS = {
  /** Primary brand color */
  PRIMARY: '#8B5CF6',
  
  /** Secondary brand color */
  SECONDARY: '#6366F1',
  
  /** Accent color */
  ACCENT: '#F59E0B',
  
  /** Success state */
  SUCCESS: '#22C55E',
  
  /** Warning state */
  WARNING: '#EAB308',
  
  /** Error state */
  ERROR: '#EF4444',
  
  /** Info state */
  INFO: '#3B82F6',
} as const;

// ============================================================================
// ZODIAC & ASTROLOGY CONSTANTS
// ============================================================================

export const ZODIAC = {
  SIGNS: [
    'Aries', 'Taurus', 'Gemini', 'Cancer',
    'Leo', 'Virgo', 'Libra', 'Scorpio',
    'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ],
  
  PLANETS: [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
    'Jupiter', 'Saturn', 'Rahu', 'Ketu'
  ],
  
  HOUSES: Array.from({ length: 12 }, (_, i) => i + 1),
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURES = {
  /** Enable dark mode toggle */
  DARK_MODE: true,
  
  /** Enable push notifications */
  PUSH_NOTIFICATIONS: true,
  
  /** Enable PWA install prompt */
  PWA_INSTALL: true,
  
  /** Enable relationship matching */
  RELATIONSHIP_MATCHING: true,
  
  /** Enable PDF reports */
  PDF_REPORTS: true,
  
  /** Enable analytics (can be disabled for dev) */
  ANALYTICS: import.meta.env.PROD,
} as const;

export default {
  DURATIONS,
  POLLING,
  CACHE,
  LIMITS,
  API,
  RATE_LIMITS,
  STORAGE_KEYS,
  BREAKPOINTS,
  COLORS,
  ZODIAC,
  FEATURES,
};
