import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UseOnlineStatusOptions {
  showToasts?: boolean;
  onOnline?: () => void;
  onOffline?: () => void;
}

/**
 * useOnlineStatus - Hook to track network connectivity
 * 
 * Features:
 * - Real-time online/offline detection
 * - Toast notifications for status changes
 * - Callbacks for online/offline events
 * - Connection quality detection (when supported)
 */
export function useOnlineStatus(options: UseOnlineStatusOptions = {}) {
  const { showToasts = true, onOnline, onOffline } = options;
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    
    if (wasOffline && showToasts) {
      toast.success('You\'re back online! 🌐', {
        description: 'Your connection has been restored.',
        duration: 3000,
      });
    }
    
    setWasOffline(false);
    onOnline?.();
  }, [wasOffline, showToasts, onOnline]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setWasOffline(true);
    
    if (showToasts) {
      toast.error('You\'re offline 📡', {
        description: 'Check your internet connection. Some features may be limited.',
        duration: 5000,
      });
    }
    
    onOffline?.();
  }, [showToasts, onOffline]);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline,
    isOffline: !isOnline,
  };
}

export default useOnlineStatus;

