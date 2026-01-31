import { useState, useEffect, useCallback, memo, createContext, useContext, ReactNode } from 'react';
import { X, Lightbulb, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

// ============================================================================
// Types
// ============================================================================

interface Tip {
  id: string;
  title: string;
  description: string;
  targetSelector?: string; // CSS selector for positioning
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  showOnce?: boolean; // Default true
  delay?: number; // ms before showing
  condition?: () => boolean; // Only show if returns true
}

interface TipContextValue {
  showTip: (tipId: string) => void;
  dismissTip: (tipId: string, permanent?: boolean) => void;
  dismissAll: () => void;
  hasSeenTip: (tipId: string) => boolean;
  resetTips: () => void;
}

// ============================================================================
// Context
// ============================================================================

const TipContext = createContext<TipContextValue | undefined>(undefined);

const STORAGE_KEY = 'astrolord_tips_seen';

export function TipProvider({ children }: { children: ReactNode }) {
  const [seenTips, setSeenTips] = useState<Set<string>>(new Set());

  // Load seen tips on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSeenTips(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  // Save seen tips
  useEffect(() => {
    if (seenTips.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(seenTips)));
    }
  }, [seenTips]);

  const showTip = useCallback((tipId: string) => {
    // This is a no-op - tips show themselves based on conditions
  }, []);

  const dismissTip = useCallback((tipId: string, permanent = true) => {
    if (permanent) {
      setSeenTips(prev => new Set([...prev, tipId]));
    }
  }, []);

  const dismissAll = useCallback(() => {
    // Mark all registered tips as seen
    const allTipIds = Object.keys(TIPS);
    setSeenTips(new Set(allTipIds));
  }, []);

  const hasSeenTip = useCallback((tipId: string) => {
    return seenTips.has(tipId);
  }, [seenTips]);

  const resetTips = useCallback(() => {
    setSeenTips(new Set());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <TipContext.Provider value={{ showTip, dismissTip, dismissAll, hasSeenTip, resetTips }}>
      {children}
    </TipContext.Provider>
  );
}

export function useTips() {
  const context = useContext(TipContext);
  if (!context) {
    throw new Error('useTips must be used within a TipProvider');
  }
  return context;
}

// ============================================================================
// Predefined Tips
// ============================================================================

export const TIPS: Record<string, Tip> = {
  'star-favorites': {
    id: 'star-favorites',
    title: '⭐ Star your favorites!',
    description: 'Click the star icon on any chart to add it to your favorites for quick access.',
    position: 'bottom',
    showOnce: true,
  },
  'keyboard-shortcuts': {
    id: 'keyboard-shortcuts',
    title: '⌨️ Keyboard shortcuts',
    description: 'Press Cmd+K (or Ctrl+K) to open quick search and navigate anywhere instantly.',
    position: 'center',
    showOnce: true,
  },
  'daily-forecast': {
    id: 'daily-forecast',
    title: '🌟 Check your daily forecast',
    description: 'Click "Daily Forecast" on any chart to see how today\'s transits affect you personally.',
    position: 'top',
    showOnce: true,
  },
  'chat-focus-modes': {
    id: 'chat-focus-modes',
    title: '🎯 Focus your questions',
    description: 'Use the focus mode buttons (Career, Love, Health) to get more targeted insights.',
    position: 'top',
    showOnce: true,
  },
  'swipe-to-navigate': {
    id: 'swipe-to-navigate',
    title: '👆 Swipe to navigate',
    description: 'On mobile, swipe left or right to move between sections.',
    position: 'center',
    showOnce: true,
  },
  'save-draft': {
    id: 'save-draft',
    title: '💾 Your work is auto-saved',
    description: 'Don\'t worry about losing data - your form entries are automatically saved as drafts.',
    position: 'top',
    showOnce: true,
  },
};

// ============================================================================
// ContextualTip Component
// ============================================================================

interface ContextualTipProps {
  tipId: keyof typeof TIPS;
  children?: ReactNode;
  className?: string;
  showArrow?: boolean;
}

export const ContextualTip = memo(({ 
  tipId, 
  children, 
  className = '',
  showArrow = true,
}: ContextualTipProps) => {
  const { hasSeenTip, dismissTip } = useTips();
  const [isVisible, setIsVisible] = useState(false);
  const tip = TIPS[tipId];

  useEffect(() => {
    if (!tip || hasSeenTip(tipId)) {
      return;
    }

    // Check condition if exists
    if (tip.condition && !tip.condition()) {
      return;
    }

    // Show after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, tip.delay || 1000);

    return () => clearTimeout(timer);
  }, [tipId, tip, hasSeenTip]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissTip(tipId, tip?.showOnce !== false);
  };

  const handleNext = () => {
    handleDismiss();
    // Could trigger next tip in sequence here
  };

  if (!isVisible || !tip) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      {children}
      
      {/* Tip Card */}
      <Card className="absolute z-50 w-72 shadow-xl border-primary/30 bg-card/95 backdrop-blur-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300"
        style={{
          ...(tip.position === 'top' && { bottom: '100%', marginBottom: '8px', left: '50%', transform: 'translateX(-50%)' }),
          ...(tip.position === 'bottom' && { top: '100%', marginTop: '8px', left: '50%', transform: 'translateX(-50%)' }),
          ...(tip.position === 'left' && { right: '100%', marginRight: '8px', top: '50%', transform: 'translateY(-50%)' }),
          ...(tip.position === 'right' && { left: '100%', marginLeft: '8px', top: '50%', transform: 'translateY(-50%)' }),
          ...(tip.position === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
        }}
      >
        {/* Arrow */}
        {showArrow && tip.position !== 'center' && (
          <div className="absolute w-3 h-3 bg-card border border-primary/30 rotate-45"
            style={{
              ...(tip.position === 'top' && { bottom: '-6px', left: '50%', marginLeft: '-6px', borderTop: 'none', borderLeft: 'none' }),
              ...(tip.position === 'bottom' && { top: '-6px', left: '50%', marginLeft: '-6px', borderBottom: 'none', borderRight: 'none' }),
              ...(tip.position === 'left' && { right: '-6px', top: '50%', marginTop: '-6px', borderBottom: 'none', borderLeft: 'none' }),
              ...(tip.position === 'right' && { left: '-6px', top: '50%', marginTop: '-6px', borderTop: 'none', borderRight: 'none' }),
            }}
          />
        )}

        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0" />
              <h4 className="font-semibold text-sm">{tip.title}</h4>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Dismiss tip"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-3">
            {tip.description}
          </p>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => dismissTip(tipId, true)}
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Don't show again
            </button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleNext}
              className="h-7 text-xs text-primary hover:text-primary"
            >
              Got it
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overlay for center position */}
      {tip.position === 'center' && (
        <div 
          className="fixed inset-0 bg-black/30 z-40" 
          onClick={handleDismiss}
        />
      )}
    </div>
  );
});

ContextualTip.displayName = 'ContextualTip';

// ============================================================================
// Floating Tip (for standalone tips not attached to elements)
// ============================================================================

interface FloatingTipProps {
  tipId: keyof typeof TIPS;
  position?: { top?: string; bottom?: string; left?: string; right?: string };
}

export const FloatingTip = memo(({ tipId, position }: FloatingTipProps) => {
  const { hasSeenTip, dismissTip } = useTips();
  const [isVisible, setIsVisible] = useState(false);
  const tip = TIPS[tipId];

  useEffect(() => {
    if (!tip || hasSeenTip(tipId)) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, tip.delay || 2000);

    return () => clearTimeout(timer);
  }, [tipId, tip, hasSeenTip]);

  const handleDismiss = () => {
    setIsVisible(false);
    dismissTip(tipId, true);
  };

  if (!isVisible || !tip) return null;

  return (
    <Card 
      className="fixed z-50 w-72 shadow-xl border-primary/30 bg-card/95 backdrop-blur-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
      style={{
        top: position?.top,
        bottom: position?.bottom || '6rem',
        left: position?.left,
        right: position?.right || '1.5rem',
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-yellow-500 shrink-0" />
            <h4 className="font-semibold text-sm">{tip.title}</h4>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-3">{tip.description}</p>
        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-7 text-xs">
            Got it <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

FloatingTip.displayName = 'FloatingTip';

export default ContextualTip;
