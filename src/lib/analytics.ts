/**
 * Analytics utility for tracking user events with Firebase Analytics
 * 
 * This module provides a clean API for tracking user actions across the app.
 * All events are sent to Firebase Analytics / Google Analytics.
 */

import { getAnalytics, logEvent, setUserProperties, setUserId } from 'firebase/analytics';
import { app } from './firebase';

// Initialize analytics
let analytics: ReturnType<typeof getAnalytics> | null = null;

const getAnalyticsInstance = () => {
    if (!analytics) {
        try {
            analytics = getAnalytics(app);
        } catch (error) {
            console.warn('Analytics not available:', error);
            return null;
        }
    }
    return analytics;
};

/**
 * Set the user ID for analytics (call after login)
 */
export const setAnalyticsUserId = (userId: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        setUserId(instance, userId);
    }
};

/**
 * Set user properties for segmentation
 */
export const setAnalyticsUserProperties = (properties: {
    subscription_tier?: string;
    has_chart?: boolean;
    signup_date?: string;
    user_source?: string;
    chart_count?: number;
    total_messages_sent?: number;
}) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        setUserProperties(instance, properties);
    }
};

// ============================================
// Authentication Events
// ============================================

export const trackSignUp = (method: 'email' | 'google' = 'email') => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'sign_up', { method });
    }
};

export const trackLogin = (method: 'email' | 'google' = 'email') => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'login', { method });
    }
};

export const trackLogout = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'logout', {});
    }
};

// ============================================
// Chart Events
// ============================================

export const trackChartCreated = (chartType: string = 'birth_chart') => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'chart_created', { chart_type: chartType });
    }
};

export const trackChartViewed = (chartType: string, chartId?: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'chart_viewed', {
            chart_type: chartType,
            chart_id: chartId?.substring(0, 10) // Don't log full ID
        });
    }
};

export const trackDivisionalViewed = (divisionalType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'divisional_viewed', { divisional_type: divisionalType });
    }
};

export const trackChartShared = (shareMethod: 'link' | 'download' | 'image') => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'share', { method: shareMethod, content_type: 'chart' });
    }
};

// ============================================
// AI Chat Events
// ============================================

export const trackChatStarted = (focusMode?: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'chat_started', { focus_mode: focusMode || 'general' });
    }
};

export const trackMessageSent = (focusMode?: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'message_sent', { focus_mode: focusMode || 'general' });
    }
};

export const trackFocusModeUsed = (focusMode: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'focus_mode_used', { focus_mode: focusMode });
    }
};

export const trackSuggestionClicked = (suggestion: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'suggestion_clicked', {
            suggestion_text: suggestion.substring(0, 50)
        });
    }
};

export const trackChatFeedback = (rating: 'like' | 'dislike', messageType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'chat_feedback', { rating, message_type: messageType });
    }
};

// ============================================
// Feature Usage Events
// ============================================

export const trackMatchmakingUsed = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'matchmaking_used', {});
    }
};

export const trackTransitsViewed = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'transits_viewed', {});
    }
};

export const trackReportDownloaded = (reportType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'report_downloaded', { report_type: reportType });
    }
};

export const trackDashaViewed = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'dasha_viewed', {});
    }
};

export const trackFeatureDiscovery = (featureName: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'feature_discovery', { feature_name: featureName });
    }
};

// ============================================
// Subscription & Payment Events
// ============================================

export const trackSubscriptionStarted = (planType: string, price: number) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'subscription_started' as any, {
            currency: 'INR',
            value: price,
            plan_type: planType
        });
    }
};

export const trackPromoCodeRedeemed = (codeType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'promo_code_redeemed', { code_type: codeType });
    }
};

export const trackPaymentFailed = (errorType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'payment_failed', { error_type: errorType });
    }
};

// ============================================
// Onboarding Events
// ============================================

export const trackOnboardingStep = (stepNumber: number, stepName: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'tutorial_begin', { step: stepNumber, step_name: stepName });
    }
};

export const trackOnboardingCompleted = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'tutorial_complete', {});
    }
};

export const trackOnboardingSkipped = (atStep: number) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'onboarding_skipped', { skipped_at_step: atStep });
    }
};

// ============================================
// Notification Events
// ============================================

export const trackNotificationEnabled = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'notification_enabled', {});
    }
};

export const trackNotificationDisabled = () => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'notification_disabled', {});
    }
};

export const trackNotificationDismissed = (location: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'notification_dismissed', { location });
    }
};

// ============================================
// Engagement & Behavior Events
// ============================================

/**
 * Track scroll depth (call when user scrolls to 25%, 50%, 75%, 100%)
 */
export const trackScrollDepth = (percentage: 25 | 50 | 75 | 100, pageName: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'scroll_depth', {
            percent_scrolled: percentage,
            page: pageName
        });
    }
};

/**
 * Track time spent on a page/section
 */
export const trackTimeOnPage = (pageName: string, seconds: number) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        // Bucket into categories for better analysis
        const bucket = seconds < 10 ? 'under_10s'
            : seconds < 30 ? '10_30s'
                : seconds < 60 ? '30_60s'
                    : seconds < 180 ? '1_3min'
                        : 'over_3min';

        logEvent(instance, 'time_on_page', {
            page: pageName,
            seconds,
            time_bucket: bucket
        });
    }
};

/**
 * Track user engagement session
 */
export const trackEngagementSession = (data: {
    sessionDurationSeconds: number;
    pagesViewed: number;
    messagesExchanged: number;
    chartsViewed: number;
}) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'engagement_session', {
            duration_seconds: data.sessionDurationSeconds,
            pages_viewed: data.pagesViewed,
            messages_exchanged: data.messagesExchanged,
            charts_viewed: data.chartsViewed
        });
    }
};

// ============================================
// Search & Navigation Events
// ============================================

export const trackSearch = (searchTerm: string, resultCount: number, searchType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'search', {
            search_term: searchTerm.substring(0, 50),
            result_count: resultCount,
            search_type: searchType
        });
    }
};

export const trackNavigation = (from: string, to: string, method: 'click' | 'direct' | 'back') => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'navigation', { from_page: from, to_page: to, method });
    }
};

// ============================================
// Error & Performance Events
// ============================================

/**
 * Track JavaScript errors
 */
export const trackError = (errorMessage: string, errorSource: string, isFatal: boolean = false) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'exception', {
            description: errorMessage.substring(0, 100),
            fatal: isFatal,
            source: errorSource
        });
    }
};

/**
 * Track API errors
 */
export const trackApiError = (endpoint: string, statusCode: number, errorMessage: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'api_error', {
            endpoint: endpoint.substring(0, 50),
            status_code: statusCode,
            error: errorMessage.substring(0, 50)
        });
    }
};

/**
 * Track page load performance
 */
export const trackPagePerformance = (pageName: string, loadTimeMs: number) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        const bucket = loadTimeMs < 1000 ? 'fast'
            : loadTimeMs < 3000 ? 'medium'
                : 'slow';

        logEvent(instance, 'page_performance', {
            page: pageName,
            load_time_ms: loadTimeMs,
            performance_bucket: bucket
        });
    }
};

/**
 * Track rage clicks (multiple rapid clicks = frustration)
 */
export const trackRageClick = (elementDescription: string, clickCount: number) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'rage_click', {
            element: elementDescription.substring(0, 50),
            click_count: clickCount
        });
    }
};

// ============================================
// Conversion Funnel Events
// ============================================

export const trackFunnelStep = (funnelName: string, stepNumber: number, stepName: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'funnel_step', {
            funnel: funnelName,
            step: stepNumber,
            step_name: stepName
        });
    }
};

export const trackConversion = (conversionType: string, value?: number) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'conversion', {
            conversion_type: conversionType,
            value: value || 0
        });
    }
};

// ============================================
// Form & Input Events
// ============================================

export const trackFormStart = (formName: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'form_start', { form_name: formName });
    }
};

export const trackFormSubmit = (formName: string, success: boolean) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'form_submit', { form_name: formName, success });
    }
};

export const trackFormAbandonment = (formName: string, lastFieldName: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'form_abandonment', {
            form_name: formName,
            last_field: lastFieldName
        });
    }
};

// ============================================
// Content Interaction Events
// ============================================

export const trackButtonClick = (buttonName: string, location: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'select_content', {
            content_type: 'button',
            item_id: buttonName,
            location
        });
    }
};

export const trackTabSwitch = (tabName: string, section: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'tab_switch', { tab_name: tabName, section });
    }
};

export const trackCopyAction = (contentType: string) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, 'copy_action', { content_type: contentType });
    }
};

// ============================================
// Generic Event Tracker
// ============================================

export const trackEvent = (eventName: string, params?: Record<string, any>) => {
    const instance = getAnalyticsInstance();
    if (instance) {
        logEvent(instance, eventName, params || {});
    }
};

// ============================================
// Utility: Auto-tracking helpers
// ============================================

/**
 * Initialize scroll depth tracking for current page
 */
export const initScrollDepthTracking = (pageName: string) => {
    const tracked = { 25: false, 50: false, 75: false, 100: false };

    const handleScroll = () => {
        const scrollPercent = Math.round(
            (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        );

        [25, 50, 75, 100].forEach(threshold => {
            if (scrollPercent >= threshold && !tracked[threshold as 25 | 50 | 75 | 100]) {
                tracked[threshold as 25 | 50 | 75 | 100] = true;
                trackScrollDepth(threshold as 25 | 50 | 75 | 100, pageName);
            }
        });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
};

/**
 * Initialize time on page tracking
 */
export const initTimeOnPageTracking = (pageName: string) => {
    const startTime = Date.now();

    return () => {
        const seconds = Math.round((Date.now() - startTime) / 1000);
        if (seconds > 3) { // Only track if more than 3 seconds
            trackTimeOnPage(pageName, seconds);
        }
    };
};

/**
 * Initialize rage click detection
 */
export const initRageClickDetection = () => {
    let clicks: { time: number; target: string }[] = [];

    const handleClick = (e: MouseEvent) => {
        const now = Date.now();
        const target = (e.target as Element)?.tagName || 'unknown';

        // Remove clicks older than 2 seconds
        clicks = clicks.filter(c => now - c.time < 2000);
        clicks.push({ time: now, target });

        // If 4+ clicks on same element type in 2 seconds = rage click
        if (clicks.length >= 4) {
            trackRageClick(target, clicks.length);
            clicks = []; // Reset
        }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
};

/**
 * Initialize global error tracking
 */
export const initErrorTracking = () => {
    window.onerror = (message, source, lineno, colno, error) => {
        trackError(
            `${message} at ${source}:${lineno}:${colno}`,
            'window.onerror',
            false
        );
    };

    window.addEventListener('unhandledrejection', (event) => {
        trackError(
            `Unhandled Promise: ${event.reason}`,
            'unhandledrejection',
            false
        );
    });
};

