import { useState, useEffect, memo, useCallback } from 'react';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureTipProps {
  id: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  showOnce?: boolean;
  delay?: number;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

const STORAGE_KEY = 'astrolord_dismissed_tips';

/**
 * FeatureTip - Contextual tooltip for feature discovery
 * 
 * Features:
 * - First-time user hints
 * - Dismissible (don't show again)
 * - Animated appearance
 * - Optional action button
 */
export const FeatureTip = memo(({
  id,
  title,
  description,
  position = 'bottom',
  showOnce = true,
  delay = 500,
  children,
  actionLabel,
  onAction,
}: FeatureTipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // Check if tip was previously dismissed
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (dismissed.includes(id)) {
        setIsDismissed(true);
        return;
      }
      setIsDismissed(false);
    } catch {
      setIsDismissed(false);
    }

    // Show tip after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [id, delay]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    
    if (showOnce) {
      try {
        const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!dismissed.includes(id)) {
          dismissed.push(id);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
        }
      } catch {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([id]));
      }
    }
    
    setIsDismissed(true);
  }, [id, showOnce]);

  const handleAction = useCallback(() => {
    onAction?.();
    handleDismiss();
  }, [onAction, handleDismiss]);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-primary/80',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-primary/80',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-primary/80',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-primary/80',
  };

  return (
    <div className="relative inline-block">
      {children}
      
      {isVisible && !isDismissed && (
        <div
          className={`absolute z-50 ${positionClasses[position]} animate-in fade-in zoom-in-95 duration-200`}
          role="tooltip"
        >
          {/* Arrow */}
          <div
            className={`absolute w-0 h-0 border-[6px] ${arrowClasses[position]}`}
          />
          
          {/* Tip content */}
          <div className="w-64 p-3 bg-gradient-to-br from-primary/90 to-primary/80 backdrop-blur-lg rounded-lg shadow-xl text-white">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 shrink-0 mt-0.5 text-yellow-300" />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm">{title}</h4>
                <p className="text-xs text-white/80 mt-1">{description}</p>
                
                {actionLabel && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-2 h-7 px-2 text-xs text-white hover:bg-white/20 hover:text-white"
                    onClick={handleAction}
                  >
                    {actionLabel}
                    <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                )}
              </div>
              
              <button
                onClick={handleDismiss}
                className="shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors"
                aria-label="Dismiss tip"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

FeatureTip.displayName = 'FeatureTip';

/**
 * Hook to manage feature tips programmatically
 */
export function useFeatureTips() {
  const dismissTip = useCallback((tipId: string) => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!dismissed.includes(tipId)) {
        dismissed.push(tipId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dismissed));
      }
    } catch {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([tipId]));
    }
  }, []);

  const resetTips = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const isTipDismissed = useCallback((tipId: string): boolean => {
    try {
      const dismissed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return dismissed.includes(tipId);
    } catch {
      return false;
    }
  }, []);

  return { dismissTip, resetTips, isTipDismissed };
}

export default FeatureTip;

