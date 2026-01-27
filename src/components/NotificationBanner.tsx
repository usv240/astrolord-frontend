/**
 * NotificationBanner - Dismissible banner for dashboard
 * Shows a compact prompt to enable notifications for users who haven't enabled them
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, Loader2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const DISMISS_KEY = 'astrolord_notification_banner_dismissed';
const DISMISS_DURATION_DAYS = 7;

export const NotificationBanner = () => {
    const { requestPermission, isLoading, permissionStatus, isSupported } = useNotifications();
    const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash
    const [isEnabling, setIsEnabling] = useState(false);

    // Check if banner should be shown
    useEffect(() => {
        // Don't show if not supported or already granted
        if (!isSupported || permissionStatus === 'granted') {
            setIsDismissed(true);
            return;
        }

        // Check if dismissed recently
        const dismissedAt = localStorage.getItem(DISMISS_KEY);
        if (dismissedAt) {
            const dismissDate = new Date(dismissedAt);
            const now = new Date();
            const daysSinceDismiss = (now.getTime() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);

            if (daysSinceDismiss < DISMISS_DURATION_DAYS) {
                setIsDismissed(true);
                return;
            }
        }

        // Show the banner
        setIsDismissed(false);
    }, [isSupported, permissionStatus]);

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, new Date().toISOString());
        setIsDismissed(true);
    };

    const handleEnable = async () => {
        setIsEnabling(true);
        try {
            const success = await requestPermission();
            if (success) {
                setIsDismissed(true);
            }
        } catch (error) {
            console.error('Failed to enable notifications:', error);
        } finally {
            setIsEnabling(false);
        }
    };

    // Don't render if dismissed or not applicable
    if (isDismissed) {
        return null;
    }

    return (
        <div className="relative mb-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 p-4 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium text-sm">
                            🔔 Never miss cosmic updates!
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Get daily forecasts, transit alerts, and special event notifications
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={handleEnable}
                        disabled={isEnabling || isLoading || permissionStatus === 'denied'}
                        className="cosmic-glow"
                    >
                        {isEnabling || isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            'Enable'
                        )}
                    </Button>

                    <button
                        onClick={handleDismiss}
                        className="p-1.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Dismiss"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Show help message if blocked */}
            {permissionStatus === 'denied' && (
                <p className="text-xs text-amber-500 mt-2">
                    ⚠️ Notifications are blocked. Click the lock icon in your address bar to enable.
                </p>
            )}
        </div>
    );
};

export default NotificationBanner;
