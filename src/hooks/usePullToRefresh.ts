import { useState, useEffect, useCallback, useRef } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Distance in px before triggering refresh
  maxPull?: number; // Maximum pull distance
  disabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  pullProgress: number; // 0-1 progress towards threshold
}

/**
 * usePullToRefresh - Enables pull-to-refresh gesture on mobile
 * 
 * Features:
 * - Touch gesture detection
 * - Threshold before triggering
 * - Visual progress feedback
 * - Works only when at top of page
 * - Haptic feedback (if available)
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 80,
  maxPull = 120,
  disabled = false,
  containerRef,
}: UsePullToRefreshOptions): PullToRefreshState & { 
  containerProps: { 
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: () => void;
  };
  PullIndicator: React.FC;
} {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    pullDistance: 0,
    pullProgress: 0,
  });

  const touchStartY = useRef(0);
  const isAtTop = useRef(true);

  // Check if at top of scroll container
  const checkIsAtTop = useCallback(() => {
    if (containerRef?.current) {
      isAtTop.current = containerRef.current.scrollTop <= 0;
    } else {
      isAtTop.current = window.scrollY <= 0;
    }
  }, [containerRef]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled || state.isRefreshing) return;
    
    checkIsAtTop();
    if (!isAtTop.current) return;

    touchStartY.current = e.touches[0].clientY;
    setState(prev => ({ ...prev, isPulling: true }));
  }, [disabled, state.isRefreshing, checkIsAtTop]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (disabled || !state.isPulling || state.isRefreshing) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    // Only pull down, not up
    if (diff <= 0) {
      setState(prev => ({ ...prev, pullDistance: 0, pullProgress: 0 }));
      return;
    }

    // Apply resistance as pull increases
    const resistance = 0.5;
    const pullDistance = Math.min(diff * resistance, maxPull);
    const pullProgress = Math.min(pullDistance / threshold, 1);

    setState(prev => ({ ...prev, pullDistance, pullProgress }));

    // Prevent scroll while pulling
    if (pullDistance > 10) {
      e.preventDefault();
    }
  }, [disabled, state.isPulling, state.isRefreshing, threshold, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing) return;

    const didPassThreshold = state.pullDistance >= threshold;

    if (didPassThreshold) {
      // Trigger haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }

      setState(prev => ({ 
        ...prev, 
        isPulling: false,
        isRefreshing: true,
        pullDistance: threshold, // Keep at threshold during refresh
      }));

      try {
        await onRefresh();
      } finally {
        setState({
          isPulling: false,
          isRefreshing: false,
          pullDistance: 0,
          pullProgress: 0,
        });
      }
    } else {
      // Didn't pass threshold, reset
      setState({
        isPulling: false,
        isRefreshing: false,
        pullDistance: 0,
        pullProgress: 0,
      });
    }
  }, [disabled, state.isRefreshing, state.pullDistance, threshold, onRefresh]);

  // Reset on scroll (in case touch events don't fire)
  useEffect(() => {
    const handleScroll = () => {
      checkIsAtTop();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [checkIsAtTop]);

  // Pull Indicator Component
  const PullIndicator: React.FC = useCallback(() => {
    const { pullDistance, pullProgress, isRefreshing } = state;
    
    if (pullDistance <= 0 && !isRefreshing) return null;

    return (
      <div 
        className="fixed top-0 left-0 right-0 flex justify-center pointer-events-none z-50 transition-transform duration-200"
        style={{ 
          transform: `translateY(${Math.min(pullDistance, maxPull) - 40}px)`,
          opacity: Math.min(pullProgress * 2, 1),
        }}
      >
        <div className={`
          flex items-center justify-center
          w-10 h-10 rounded-full
          bg-card/95 backdrop-blur-lg
          border border-primary/30
          shadow-lg
          ${isRefreshing ? 'animate-spin' : ''}
        `}>
          <div 
            className={`
              w-5 h-5 rounded-full border-2 border-primary
              ${isRefreshing ? 'border-t-transparent animate-spin' : ''}
            `}
            style={{
              transform: isRefreshing ? 'none' : `rotate(${pullProgress * 360}deg)`,
            }}
          >
            {!isRefreshing && (
              <svg 
                viewBox="0 0 24 24" 
                className="w-full h-full text-primary"
                style={{ transform: `rotate(${pullProgress * 180}deg)` }}
              >
                <path
                  fill="currentColor"
                  d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    );
  }, [state, maxPull]);

  return {
    ...state,
    containerProps: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    PullIndicator,
  };
}

export default usePullToRefresh;
