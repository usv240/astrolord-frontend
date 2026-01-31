/**
 * Rate Limit Hook
 * 
 * Provides rate limiting functionality with countdown timer.
 * Shows users how long they need to wait before they can try again.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { RATE_LIMITS } from '@/config/constants';

interface RateLimitState {
  /** Whether the user is currently rate limited */
  isRateLimited: boolean;
  /** Seconds remaining until rate limit expires */
  secondsRemaining: number;
  /** Formatted countdown string (e.g., "0:45" or "1:30") */
  countdownDisplay: string;
  /** Reset the rate limit (e.g., after manual unlock) */
  reset: () => void;
  /** Trigger rate limit with optional custom duration */
  trigger: (durationMs?: number) => void;
  /** Check if an action should be blocked */
  shouldBlock: () => boolean;
}

/**
 * Hook to manage rate limiting with visual countdown
 * 
 * @param key - Unique key for this rate limit (allows multiple independent limits)
 * @param defaultDurationMs - Default rate limit duration in milliseconds
 * @returns Rate limit state and controls
 * 
 * @example
 * ```tsx
 * const { isRateLimited, countdownDisplay, trigger } = useRateLimit('chat', 60000);
 * 
 * const handleSubmit = async () => {
 *   if (isRateLimited) {
 *     toast.error(`Wait ${countdownDisplay} before sending another message`);
 *     return;
 *   }
 *   try {
 *     await sendMessage();
 *   } catch (error) {
 *     if (error.response?.status === 429) {
 *       trigger(); // Start countdown
 *     }
 *   }
 * };
 * ```
 */
export function useRateLimit(
  key: string,
  defaultDurationMs: number = RATE_LIMITS.RATE_LIMIT_COOLDOWN
): RateLimitState {
  const [expiresAt, setExpiresAt] = useState<number | null>(() => {
    // Check localStorage for persisted rate limit
    const stored = localStorage.getItem(`rateLimit_${key}`);
    if (stored) {
      const expiry = parseInt(stored, 10);
      if (expiry > Date.now()) {
        return expiry;
      }
      localStorage.removeItem(`rateLimit_${key}`);
    }
    return null;
  });
  
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate if rate limited and update countdown
  const updateCountdown = useCallback(() => {
    if (!expiresAt) {
      setSecondsRemaining(0);
      return;
    }

    const remaining = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
    setSecondsRemaining(remaining);

    if (remaining <= 0) {
      setExpiresAt(null);
      localStorage.removeItem(`rateLimit_${key}`);
    }
  }, [expiresAt, key]);

  // Set up countdown interval
  useEffect(() => {
    updateCountdown();

    if (expiresAt && expiresAt > Date.now()) {
      intervalRef.current = setInterval(updateCountdown, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [expiresAt, updateCountdown]);

  // Format countdown display
  const countdownDisplay = useCallback(() => {
    if (secondsRemaining <= 0) return '';
    
    const minutes = Math.floor(secondsRemaining / 60);
    const seconds = secondsRemaining % 60;
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }, [secondsRemaining])();

  // Trigger rate limit
  const trigger = useCallback((durationMs?: number) => {
    const duration = durationMs ?? defaultDurationMs;
    const expiry = Date.now() + duration;
    setExpiresAt(expiry);
    localStorage.setItem(`rateLimit_${key}`, expiry.toString());
  }, [key, defaultDurationMs]);

  // Reset rate limit
  const reset = useCallback(() => {
    setExpiresAt(null);
    setSecondsRemaining(0);
    localStorage.removeItem(`rateLimit_${key}`);
  }, [key]);

  // Check if action should be blocked
  const shouldBlock = useCallback(() => {
    return expiresAt !== null && expiresAt > Date.now();
  }, [expiresAt]);

  return {
    isRateLimited: secondsRemaining > 0,
    secondsRemaining,
    countdownDisplay,
    reset,
    trigger,
    shouldBlock,
  };
}

/**
 * Parse retry-after header from API response
 */
export function parseRetryAfter(response: { headers?: Record<string, string> }): number | null {
  const retryAfter = response.headers?.['retry-after'];
  if (!retryAfter) return null;

  // Can be seconds or HTTP date
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds * 1000; // Convert to ms
  }

  // Try parsing as date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    return Math.max(0, date.getTime() - Date.now());
  }

  return null;
}

/**
 * Handle rate limit error from API
 */
export function handleRateLimitError(
  error: any,
  triggerRateLimit: (durationMs?: number) => void,
  defaultDurationMs: number = RATE_LIMITS.RATE_LIMIT_COOLDOWN
): boolean {
  if (error?.response?.status === 429) {
    const retryAfter = parseRetryAfter(error.response);
    triggerRateLimit(retryAfter ?? defaultDurationMs);
    return true;
  }
  return false;
}

export default useRateLimit;
