import { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface SessionTimeoutWarningProps {
  warningTimeMs?: number; // Time before session expires to show warning (default: 5 minutes)
  sessionTimeoutMs?: number; // Total session duration (default: 30 minutes of inactivity)
  onExtend?: () => void;
}

/**
 * SessionTimeoutWarning - Warns users before session expires
 * 
 * Features:
 * - Countdown timer display
 * - Extend session option
 * - Auto-logout when expired
 * - Activity detection to reset timer
 */
export const SessionTimeoutWarning = memo(({
  warningTimeMs = 5 * 60 * 1000, // 5 minutes warning
  sessionTimeoutMs = 30 * 60 * 1000, // 30 minutes total
  onExtend,
}: SessionTimeoutWarningProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [lastActivity, setLastActivity] = useState(Date.now());

  // Track user activity
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowWarning(false);
    };

    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  // Check for timeout
  useEffect(() => {
    if (!user) return;

    const checkTimeout = () => {
      const now = Date.now();
      const elapsed = now - lastActivity;
      const remaining = sessionTimeoutMs - elapsed;

      if (remaining <= 0) {
        // Session expired
        handleLogout();
      } else if (remaining <= warningTimeMs) {
        // Show warning
        setTimeRemaining(remaining);
        setShowWarning(true);
      } else {
        setShowWarning(false);
      }
    };

    // Check every second
    const interval = setInterval(checkTimeout, 1000);
    
    return () => clearInterval(interval);
  }, [user, lastActivity, sessionTimeoutMs, warningTimeMs]);

  const handleExtend = useCallback(() => {
    setLastActivity(Date.now());
    setShowWarning(false);
    toast.success('Session extended!', {
      description: 'Your session has been extended by 30 minutes.',
    });
    onExtend?.();
  }, [onExtend]);

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
    navigate('/login');
    toast.info('Session expired', {
      description: 'You have been logged out due to inactivity.',
    });
  }, [logout, navigate]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user || !showWarning) return null;

  return (
    <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Session Expiring Soon
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Your session will expire in{' '}
              <span className="font-bold text-amber-500 text-lg">
                {formatTime(timeRemaining)}
              </span>
              {' '}due to inactivity.
            </p>
            <p className="text-xs">
              Click "Stay Logged In" to continue your session, or your work will be saved and you'll be logged out automatically.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Visual countdown bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-1000 ease-linear"
            style={{ 
              width: `${(timeRemaining / warningTimeMs) * 100}%` 
            }}
          />
        </div>

        <AlertDialogFooter className="flex gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button onClick={handleExtend} className="cosmic-glow">
              <RefreshCw className="h-4 w-4 mr-2" />
              Stay Logged In
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

SessionTimeoutWarning.displayName = 'SessionTimeoutWarning';

export default SessionTimeoutWarning;
