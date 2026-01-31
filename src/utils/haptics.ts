/**
 * Haptics - Cross-platform haptic feedback utility
 * 
 * Features:
 * - Vibration API for Android/PWA
 * - Graceful fallback when not supported
 * - Different intensity patterns
 * - iOS-friendly (uses alternative feedback)
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection';

interface HapticPatterns {
  [key: string]: number | number[];
}

// Vibration patterns (in milliseconds)
const PATTERNS: HapticPatterns = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 30, 10], // Short-pause-short
  error: [50, 50, 50], // Long-pause-long-pause-long
  selection: 5,
};

/**
 * Check if vibration is supported
 */
export function isHapticsSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Trigger haptic feedback
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  if (!isHapticsSupported()) return;

  try {
    const pattern = PATTERNS[type] || PATTERNS.light;
    navigator.vibrate(pattern);
  } catch {
    // Silently fail if vibration fails - no logging needed
  }
}

/**
 * Light tap feedback - for button presses
 */
export function hapticLight(): void {
  triggerHaptic('light');
}

/**
 * Medium feedback - for confirmations
 */
export function hapticMedium(): void {
  triggerHaptic('medium');
}

/**
 * Heavy feedback - for important actions
 */
export function hapticHeavy(): void {
  triggerHaptic('heavy');
}

/**
 * Success feedback - for completed actions
 */
export function hapticSuccess(): void {
  triggerHaptic('success');
}

/**
 * Error feedback - for failures
 */
export function hapticError(): void {
  triggerHaptic('error');
}

/**
 * Selection feedback - for toggles, switches
 */
export function hapticSelection(): void {
  triggerHaptic('selection');
}

/**
 * Custom vibration pattern
 */
export function hapticCustom(pattern: number | number[]): void {
  if (!isHapticsSupported()) return;

  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently fail - no logging needed
  }
}

/**
 * Stop any ongoing vibration
 */
export function hapticStop(): void {
  if (!isHapticsSupported()) return;

  try {
    navigator.vibrate(0);
  } catch (error) {
    // Ignore
  }
}

// ============================================================================
// React Hook
// ============================================================================

import { useCallback } from 'react';

interface UseHapticsOptions {
  enabled?: boolean;
}

export function useHaptics({ enabled = true }: UseHapticsOptions = {}) {
  const supported = isHapticsSupported();

  const trigger = useCallback((type: HapticType = 'light') => {
    if (enabled && supported) {
      triggerHaptic(type);
    }
  }, [enabled, supported]);

  const light = useCallback(() => trigger('light'), [trigger]);
  const medium = useCallback(() => trigger('medium'), [trigger]);
  const heavy = useCallback(() => trigger('heavy'), [trigger]);
  const success = useCallback(() => trigger('success'), [trigger]);
  const error = useCallback(() => trigger('error'), [trigger]);
  const selection = useCallback(() => trigger('selection'), [trigger]);

  return {
    supported,
    trigger,
    light,
    medium,
    heavy,
    success,
    error,
    selection,
  };
}

export default {
  isSupported: isHapticsSupported,
  trigger: triggerHaptic,
  light: hapticLight,
  medium: hapticMedium,
  heavy: hapticHeavy,
  success: hapticSuccess,
  error: hapticError,
  selection: hapticSelection,
  custom: hapticCustom,
  stop: hapticStop,
};
