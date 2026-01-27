// Google Analytics 4 Setup Helper
// Complete GA4 Implementation for AstroLord

type GTAGFunction = (...args: any[]) => void;

declare global {
  interface Window {
    gtag?: GTAGFunction;
    dataLayer?: any[];
  }
}

// Initialize Google Analytics
export const initializeGA = (measurementId: string) => {
  // Silently skip if GA4 ID is not configured
  if (!measurementId || measurementId.includes('XXXXXXXXXX')) {
    return;
  }

  // Prevent duplicate initialization
  if (window.gtag) {
    return;
  }

  try {
    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onload = () => {
      console.log('Google Analytics script loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load Google Analytics script');
    };
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer?.push(arguments);
    };
    
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_path: window.location.pathname,
      allow_google_signals: true,
      allow_ad_personalization_signals: true,
    });

    // Track initial page view
    trackPageView(window.location.pathname, document.title);
    
    console.log('Google Analytics initialized with ID:', measurementId);
  } catch (error) {
    console.error('Error initializing Google Analytics:', error);
  }
};

// Track Page Views (called when route changes)
export const trackPageView = (pagePath: string, pageTitle: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle,
      page_location: window.location.href,
    });
  }
};

// Track Custom Events
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...eventParams,
      timestamp: new Date().toISOString(),
    });
  }
};

// Track User Sign Up
export const trackSignUp = (method: string = 'email') => {
  trackEvent('sign_up', {
    method: method, // 'email', 'google', 'github', etc.
  });
};

// Track Login
export const trackLogin = (method: string = 'email') => {
  trackEvent('login', {
    method: method,
  });
};

// Track Subscription Purchase
export const trackPurchase = (value: number, currency: string = 'USD', items?: any[]) => {
  trackEvent('purchase', {
    value: value,
    currency: currency,
    items: items || [],
    transaction_id: `txn_${Date.now()}`,
  });
};

// Track Begin Checkout
export const trackBeginCheckout = (value: number, currency: string = 'USD') => {
  trackEvent('begin_checkout', {
    value: value,
    currency: currency,
  });
};

// Track Add to Cart (for upgrade flow)
export const trackAddToCart = (itemName: string, value: number, currency: string = 'USD') => {
  trackEvent('add_to_cart', {
    item_name: itemName,
    value: value,
    currency: currency,
  });
};

// Track Chat Message (Engagement)
export const trackChatMessage = (messageCount: number = 1) => {
  trackEvent('engagement', {
    engagement_type: 'chat_message',
    message_count: messageCount,
  });
};

// Track Chart Generated
export const trackChartGenerated = (chartType: string = 'natal_chart') => {
  trackEvent('chart_generated', {
    chart_type: chartType,
  });
};

// Track Button Clicks
export const trackButtonClick = (buttonName: string, location: string = 'unknown') => {
  trackEvent('button_click', {
    button_name: buttonName,
    location: location,
  });
};

// Track Link Clicks
export const trackLinkClick = (linkName: string, linkUrl: string = '') => {
  trackEvent('link_click', {
    link_name: linkName,
    link_url: linkUrl,
  });
};

// Track Page Scroll Depth
export const trackScrollDepth = (scrollPercentage: number) => {
  trackEvent('scroll_depth', {
    scroll_percentage: scrollPercentage,
  });
};

// Track Time on Page (call when leaving page)
export const trackTimeOnPage = (pageName: string, secondsSpent: number) => {
  trackEvent('time_on_page', {
    page_name: pageName,
    seconds: secondsSpent,
  });
};

// Track Feature Usage
export const trackFeatureUsage = (featureName: string, action: string = 'use') => {
  trackEvent('feature_usage', {
    feature_name: featureName,
    action: action,
  });
};

// Track Error
export const trackError = (errorName: string, errorMessage: string = '') => {
  trackEvent('error', {
    error_name: errorName,
    error_message: errorMessage,
  });
};

// Track Search
export const trackSearch = (searchQuery: string, resultsCount: number = 0) => {
  trackEvent('search', {
    search_term: searchQuery,
    results_count: resultsCount,
  });
};

// Track Newsletter Signup
export const trackNewsletterSignup = (email?: string) => {
  trackEvent('newsletter_signup', {
    email: email || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

// Track Subscription Plan View
export const trackSubscriptionPlan = (planName: string, price: number, duration: string = 'monthly') => {
  trackEvent('view_item', {
    item_name: planName,
    price: price,
    item_category: 'subscription',
    duration: duration,
  });
};

// Track Refund Request
export const trackRefundRequest = (orderId: string, reason: string = '') => {
  trackEvent('refund_request', {
    order_id: orderId,
    reason: reason,
  });
};

// Track Refund Processed
export const trackRefundProcessed = (orderId: string, amount: number) => {
  trackEvent('refund_processed', {
    order_id: orderId,
    amount: amount,
  });
};

// Set User ID (for tracking authenticated user behavior)
export const setUserId = (userId: string) => {
  if (window.gtag) {
    window.gtag('config', {
      'user_id': userId,
    });
  }
};

// Set User Property
export const setUserProperty = (propertyName: string, propertyValue: any) => {
  if (window.gtag) {
    window.gtag('event', 'user_property', {
      [propertyName]: propertyValue,
    });
  }
};

// Track View Item (for chart, reading, etc.)
export const trackViewItem = (itemName: string, itemCategory: string = 'chart') => {
  trackEvent('view_item', {
    item_name: itemName,
    item_category: itemCategory,
  });
};

// Track Refund Initiation
export const trackRefundInitiation = (plan: string, reason?: string) => {
  trackEvent('refund_initiation', {
    plan: plan,
    reason: reason || 'user_requested',
  });
};

// Track Churn (Subscription Cancellation)
export const trackChurn = (userId: string, plan: string, reason?: string) => {
  trackEvent('churn', {
    user_id: userId,
    plan: plan,
    reason: reason || 'unknown',
  });
};

// Track Feature Access Denied (for free vs premium features)
export const trackFeatureAccessDenied = (featureName: string, reason: string = 'not_subscribed') => {
  trackEvent('feature_access_denied', {
    feature_name: featureName,
    reason: reason,
  });
};

// Track Payment Error
export const trackPaymentError = (errorCode: string, errorMessage: string) => {
  trackEvent('payment_error', {
    error_code: errorCode,
    error_message: errorMessage,
  });
};

// Track Page Performance
export const trackPagePerformance = (pageName: string, loadTimeMs: number) => {
  trackEvent('page_performance', {
    page_name: pageName,
    load_time_ms: loadTimeMs,
  });
};

// Setup Page View Tracking with React Router
export const setupPageViewTracking = (callback?: (path: string, title: string) => void) => {
  const handleRouteChange = () => {
    const path = window.location.pathname;
    const title = document.title;
    trackPageView(path, title);
    callback?.(path, title);
  };

  // Track initial page view
  handleRouteChange();

  // Listen for route changes (works with React Router)
  window.addEventListener('popstate', handleRouteChange);
  
  return () => {
    window.removeEventListener('popstate', handleRouteChange);
  };
};

// Track Scroll Depth automatically
export const setupScrollDepthTracking = () => {
  let maxScroll = 0;

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

    // Track at 25%, 50%, 75%, 100%
    if (scrollPercent >= 25 && maxScroll < 25) {
      trackScrollDepth(25);
      maxScroll = 25;
    } else if (scrollPercent >= 50 && maxScroll < 50) {
      trackScrollDepth(50);
      maxScroll = 50;
    } else if (scrollPercent >= 75 && maxScroll < 75) {
      trackScrollDepth(75);
      maxScroll = 75;
    } else if (scrollPercent >= 100 && maxScroll < 100) {
      trackScrollDepth(100);
      maxScroll = 100;
    }
  };

  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
};

// Track Time on Page automatically
export const setupTimeOnPageTracking = (pageName: string) => {
  const startTime = Date.now();

  const handleUnload = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackTimeOnPage(pageName, timeSpent);
  };

  window.addEventListener('beforeunload', handleUnload);
  
  return () => {
    window.removeEventListener('beforeunload', handleUnload);
  };
};
