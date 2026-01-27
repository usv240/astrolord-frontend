import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageView,
  setupScrollDepthTracking,
  setupTimeOnPageTracking,
  setupPageViewTracking,
} from '@/utils/analytics';

/**
 * Custom hook for Google Analytics integration
 * Automatically tracks page views and engagement metrics
 * 
 * Usage:
 * const pageName = 'Home';
 * useGA(pageName);
 */
export const useGA = (pageName: string) => {
  const location = useLocation();

  useEffect(() => {
    // Track page view when route changes
    trackPageView(location.pathname, pageName);
  }, [location.pathname, pageName]);

  // Setup automatic tracking on mount
  useEffect(() => {
    // Track scroll depth
    const unsubscribeScroll = setupScrollDepthTracking();

    // Track time on page
    const unsubscribeTime = setupTimeOnPageTracking(pageName);

    return () => {
      unsubscribeScroll();
      unsubscribeTime();
    };
  }, [pageName]);
};

/**
 * Hook to track individual page performance
 * Usage:
 * usePagePerformance('Dashboard');
 */
export const usePagePerformance = (pageName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const endTime = performance.now();
      const loadTime = Math.round(endTime - startTime);
      
      if (window.gtag) {
        window.gtag('event', 'page_performance', {
          page_name: pageName,
          load_time_ms: loadTime,
        });
      }
    };
  }, [pageName]);
};

/**
 * Hook for tracking user interactions
 * Usage:
 * const trackClick = useTrackEvent();
 * onClick={() => trackClick('button_name', { label: 'Premium' })}
 */
export const useTrackEvent = () => {
  return (eventName: string, eventParams?: Record<string, any>) => {
    if (window.gtag) {
      window.gtag('event', eventName, {
        ...eventParams,
        timestamp: new Date().toISOString(),
      });
    }
  };
};
