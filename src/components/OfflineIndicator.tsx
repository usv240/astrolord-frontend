import { memo } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

/**
 * OfflineIndicator - Shows a banner when the user is offline
 * 
 * Features:
 * - Fixed banner at top of screen
 * - Retry button to check connection
 * - Animated appearance
 * - Auto-hides when back online
 */
export const OfflineIndicator = memo(() => {
  const { isOffline } = useOnlineStatus({ showToasts: true });

  if (!isOffline) return null;

  const handleRetry = () => {
    // Trigger a simple fetch to check connectivity
    fetch('/api/health', { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        // If successful, the online event will fire automatically
        window.dispatchEvent(new Event('online'));
      })
      .catch(() => {
        // Still offline
      });
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 text-white px-4 py-2.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
              <WifiOff className="h-4 w-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-medium text-sm">You're offline</span>
              <span className="text-xs text-white/80 hidden sm:inline">•</span>
              <span className="text-xs text-white/80">Some features may be unavailable</span>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRetry}
            className="text-white hover:bg-white/20 hover:text-white h-8 px-3"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
});

OfflineIndicator.displayName = 'OfflineIndicator';

export default OfflineIndicator;

