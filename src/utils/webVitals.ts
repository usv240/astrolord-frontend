/**
 * Web Vitals Performance Tracking
 * 
 * Tracks Core Web Vitals metrics and sends them to analytics.
 * These metrics are crucial for SEO and user experience.
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint) - Perceived load speed
 * - TTFB (Time to First Byte) - Server response time
 * - INP (Interaction to Next Paint) - Responsiveness
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
import { trackEvent } from '@/utils/analytics';
import { createLogger } from '@/utils/logger';

const log = createLogger('WebVitals');

// Thresholds based on Google's recommendations
// Note: FID has been replaced by INP in web-vitals v4+
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
};

type MetricName = keyof typeof THRESHOLDS;

/**
 * Get rating based on metric value and thresholds
 */
const getRating = (name: MetricName, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[name];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};

/**
 * Send metric to analytics
 */
const sendToAnalytics = (metric: Metric) => {
  const { name, value, id, delta, navigationType } = metric;
  const rating = getRating(name as MetricName, value);
  
  // Log in development for debugging
  if (import.meta.env.DEV) {
    const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
    log.debug(`${color} ${name}: ${value.toFixed(2)} (${rating})`);
  }
  
  // Send to Google Analytics
  trackEvent('web_vitals', {
    metric_name: name,
    metric_value: Math.round(name === 'CLS' ? value * 1000 : value), // CLS is a ratio, multiply for GA
    metric_id: id,
    metric_delta: Math.round(delta),
    metric_rating: rating,
    navigation_type: navigationType,
  });
};

/**
 * Initialize Web Vitals tracking
 * Call this once when the app starts
 */
export const initWebVitals = () => {
  try {
    // Core Web Vitals (the ones that matter for SEO)
    // Note: FID has been replaced by INP in web-vitals v4+
    onLCP(sendToAnalytics);
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    
    // Additional useful metrics
    onFCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
    
    if (import.meta.env.DEV) {
      log.info('Web Vitals tracking initialized');
    }
  } catch (error) {
    // Silently fail - web vitals tracking is not critical
    if (import.meta.env.DEV) {
      log.error('Failed to initialize Web Vitals', { error });
    }
  }
};

/**
 * Get all current Web Vitals as a report
 * Useful for debugging and displaying in admin dashboard
 */
export interface WebVitalsReport {
  lcp: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  inp: number | null;
  timestamp: string;
}

let currentReport: WebVitalsReport = {
  lcp: null,
  cls: null,
  fcp: null,
  ttfb: null,
  inp: null,
  timestamp: new Date().toISOString(),
};

/**
 * Initialize Web Vitals with local report storage
 * Useful when you want to display vitals in the UI
 */
export const initWebVitalsWithReport = (onUpdate?: (report: WebVitalsReport) => void) => {
  const updateReport = (metric: Metric) => {
    const key = metric.name.toLowerCase() as keyof Omit<WebVitalsReport, 'timestamp'>;
    currentReport = {
      ...currentReport,
      [key]: metric.value,
      timestamp: new Date().toISOString(),
    };
    
    sendToAnalytics(metric);
    onUpdate?.(currentReport);
  };
  
  try {
    onLCP(updateReport);
    onCLS(updateReport);
    onINP(updateReport);
    onFCP(updateReport);
    onTTFB(updateReport);
  } catch {
    // Silently fail
  }
};

/**
 * Get the current Web Vitals report
 */
export const getWebVitalsReport = (): WebVitalsReport => currentReport;

export default initWebVitals;
