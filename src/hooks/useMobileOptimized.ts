/**
 * Centralized Mobile React Hooks
 * Comprehensive mobile detection and optimization hooks
 * 
 * Usage:
 * - const isMobile = useIsMobile()
 * - const orientation = useDeviceOrientation()
 * - const touchSupport = useTouchSupport()
 */

import * as React from 'react';
import { MOBILE_BREAKPOINTS, getMediaQuery } from '@/utils/mobile';

// ============================================================================
// useIsMobile - Enhanced version with all breakpoints
// ============================================================================
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINTS.md - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINTS.md);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINTS.md);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

// ============================================================================
// useMediaQuery - Generic hook for custom breakpoints
// ============================================================================
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ============================================================================
// useBreakpoint - Get current breakpoint
// ============================================================================
export function useBreakpoint(): keyof typeof MOBILE_BREAKPOINTS | 'unknown' {
  const [breakpoint, setBreakpoint] = React.useState<keyof typeof MOBILE_BREAKPOINTS | 'unknown'>('unknown');

  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      let current: keyof typeof MOBILE_BREAKPOINTS | 'unknown' = 'unknown';

      if (width < MOBILE_BREAKPOINTS.sm) current = 'xs';
      else if (width < MOBILE_BREAKPOINTS.md) current = 'sm';
      else if (width < MOBILE_BREAKPOINTS.lg) current = 'md';
      else if (width < MOBILE_BREAKPOINTS.xl) current = 'lg';
      else if (width < MOBILE_BREAKPOINTS['2xl']) current = 'xl';
      else current = '2xl';

      setBreakpoint(current);
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return breakpoint;
}

// ============================================================================
// useDeviceOrientation - Portrait/Landscape detection
// ============================================================================
export interface DeviceOrientation {
  type: 'portrait' | 'landscape';
  angle: number;
}

export function useDeviceOrientation(): DeviceOrientation {
  const [orientation, setOrientation] = React.useState<DeviceOrientation>({
    type: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
    angle: window.screen.orientation?.angle || 0,
  });

  React.useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        type: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
        angle: window.screen.orientation?.angle || 0,
      });
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  return orientation;
}

// ============================================================================
// useTouchSupport - Detect touch capability
// ============================================================================
export interface TouchCapabilities {
  hasTouch: boolean;
  maxTouchPoints: number;
  isPointerEvent: boolean;
}

export function useTouchSupport(): TouchCapabilities {
  const [touchCapabilities, setTouchCapabilities] = React.useState<TouchCapabilities>({
    hasTouch: false,
    maxTouchPoints: 0,
    isPointerEvent: false,
  });

  React.useEffect(() => {
    const hasTouch =
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      ('msMaxTouchPoints' in navigator && (navigator as any).msMaxTouchPoints > 0);

    const isPointerEvent =
      'PointerEvent' in window &&
      !(window.navigator as any).userAgentData?.mobile === false;

    const capabilities: TouchCapabilities = {
      hasTouch,
      maxTouchPoints: navigator.maxTouchPoints || 0,
      isPointerEvent,
    };

    setTouchCapabilities(capabilities);
  }, []);

  return touchCapabilities;
}

// ============================================================================
// useVirtualKeyboardHeight - Detect virtual keyboard height
// ============================================================================
export function useVirtualKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  React.useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const screenHeight = window.screen.height;
      const visibleHeight = Math.min(windowHeight, screenHeight);
      const calculatedHeight = screenHeight - visibleHeight;

      setKeyboardHeight(Math.max(0, calculatedHeight));
    };

    window.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return keyboardHeight;
}

// ============================================================================
// useResponsiveValue - Get value based on breakpoint
// ============================================================================
export function useResponsiveValue<T>(
  values: Partial<Record<keyof typeof MOBILE_BREAKPOINTS, T>>
): T | undefined {
  const breakpoint = useBreakpoint();

  if (breakpoint === 'unknown') return undefined;

  // Try exact breakpoint match first
  if (breakpoint in values) {
    return values[breakpoint as keyof typeof MOBILE_BREAKPOINTS];
  }

  // Fallback to closest smaller breakpoint
  const breakpoints = Object.entries(MOBILE_BREAKPOINTS)
    .sort(([, a], [, b]) => a - b);

  const currentBreakpointValue = MOBILE_BREAKPOINTS[breakpoint as keyof typeof MOBILE_BREAKPOINTS];

  for (let i = breakpoints.length - 1; i >= 0; i--) {
    const [key, value] = breakpoints[i];
    if (value <= currentBreakpointValue && key in values) {
      return values[key as keyof typeof MOBILE_BREAKPOINTS];
    }
  }

  return undefined;
}

// ============================================================================
// useIsSmallScreen - Various small screen sizes
// ============================================================================
export interface SmallScreenChecks {
  isMobileXS: boolean;  // < 375px
  isMobileSM: boolean;  // < 425px
  isMobileMD: boolean;  // < 768px
  isTablet: boolean;    // < 1024px
  isDesktop: boolean;   // >= 1024px
}

export function useIsSmallScreen(): SmallScreenChecks {
  const isMobileXS = useMediaQuery(getMediaQuery('xs'));
  const isMobileSM = useMediaQuery(getMediaQuery('sm'));
  const isMobileMD = useMediaQuery(getMediaQuery('md'));
  const isTablet = useMediaQuery(getMediaQuery('lg'));

  return {
    isMobileXS,
    isMobileSM,
    isMobileMD,
    isTablet,
    isDesktop: !isMobileMD,
  };
}

// ============================================================================
// useSafeAreaInsets - Get safe area insets (notched devices)
// ============================================================================
export interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export function useSafeAreaInsets(): SafeAreaInsets {
  const [insets, setInsets] = React.useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  React.useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);

    const getInset = (property: string): number => {
      const value = style.getPropertyValue(property).trim();
      return parseInt(value) || 0;
    };

    setInsets({
      top: getInset('--safe-area-inset-top'),
      bottom: getInset('--safe-area-inset-bottom'),
      left: getInset('--safe-area-inset-left'),
      right: getInset('--safe-area-inset-right'),
    });
  }, []);

  return insets;
}

// ============================================================================
// useTapFeedback - Enhance tap feedback on touch devices
// ============================================================================
export function useTapFeedback() {
  const { hasTouch } = useTouchSupport();
  const [isTapped, setIsTapped] = React.useState(false);

  const handleTouchStart = () => {
    setIsTapped(true);
  };

  const handleTouchEnd = () => {
    setIsTapped(false);
  };

  return {
    isTapped: hasTouch ? isTapped : false,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
  };
}

// ============================================================================
// useScrollLock - Prevent scroll on mobile (e.g., for modals)
// ============================================================================
export function useScrollLock(isLocked: boolean) {
  React.useEffect(() => {
    if (isLocked) {
      // Store original overflow value
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLocked]);
}

// ============================================================================
// useKeyboardAware - Adjust layout when keyboard appears
// ============================================================================
export function useKeyboardAware() {
  const keyboardHeight = useVirtualKeyboardHeight();
  const { isMobileMD } = useIsSmallScreen();

  return {
    keyboardHeight,
    shouldAdjust: isMobileMD && keyboardHeight > 0,
    bottomOffset: keyboardHeight > 0 ? keyboardHeight : 0,
  };
}

// ============================================================================
// useHapticFeedback - Trigger haptic feedback on supported devices
// ============================================================================
export function useHapticFeedback() {
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const vibrate = (pattern: number | number[] = 10) => {
    if (canVibrate) {
      navigator.vibrate(pattern);
    }
  };

  const light = () => vibrate(10);
  const medium = () => vibrate(20);
  const heavy = () => vibrate(50);
  const pulse = () => vibrate([10, 20, 10]);
  const success = () => vibrate([10, 30, 10, 30, 10]);

  return {
    canVibrate,
    vibrate,
    light,
    medium,
    heavy,
    pulse,
    success,
  };
}
