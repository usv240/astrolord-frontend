/**
 * NotificationPrompt - Modal component for requesting notification permission
 * Used after onboarding completion to encourage users to enable push notifications
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, BellOff, Loader2, X, Sparkles, Calendar, AlertTriangle, Moon } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { createLogger } from '@/utils/logger';

const log = createLogger('NotificationPrompt');

interface NotificationPromptProps {
    onComplete: () => void;
    onSkip: () => void;
}

export const NotificationPrompt = ({ onComplete, onSkip }: NotificationPromptProps) => {
    const { requestPermission, isLoading, permissionStatus, isSupported } = useNotifications();
    const [isEnabling, setIsEnabling] = useState(false);

    // Don't show if not supported or already granted
    if (!isSupported || permissionStatus === 'granted') {
        onComplete();
        return null;
    }

    const handleEnable = async () => {
        setIsEnabling(true);
        try {
            const success = await requestPermission();
            if (success) {
                onComplete();
            } else {
                // Permission was denied or failed - still allow them to continue
                setIsEnabling(false);
            }
        } catch (error) {
            log.error('Failed to enable notifications', { error: String(error) });
            setIsEnabling(false);
        }
    };

    const benefits = [
        { icon: <Sparkles className="h-4 w-4 text-yellow-400" />, text: 'Daily personalized cosmic insights' },
        { icon: <Moon className="h-4 w-4 text-purple-400" />, text: 'Full moon & eclipse alerts' },
        { icon: <AlertTriangle className="h-4 w-4 text-amber-400" />, text: 'Quota usage warnings' },
        { icon: <Calendar className="h-4 w-4 text-blue-400" />, text: 'Subscription reminders' },
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-primary/50 bg-card/95 backdrop-blur-xl animate-in fade-in-0 zoom-in-95 duration-300">
                <CardHeader className="relative text-center pb-2">
                    <button
                        onClick={onSkip}
                        className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Animated bell icon */}
                    <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20 animate-pulse">
                        <Bell className="h-10 w-10 text-primary" />
                    </div>

                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Stay Cosmically Connected
                    </CardTitle>
                    <p className="text-muted-foreground text-sm mt-2">
                        Get personalized updates delivered right to your browser
                    </p>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Benefits list */}
                    <div className="space-y-3">
                        {benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                                <div className="p-1.5 rounded-lg bg-muted/50">
                                    {benefit.icon}
                                </div>
                                <span className="text-foreground">{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    {/* Permission denied message */}
                    {permissionStatus === 'denied' && (
                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                ⚠️ Notifications are blocked. Click the lock icon in your browser's address bar to enable them.
                            </p>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleEnable}
                            disabled={isEnabling || isLoading || permissionStatus === 'denied'}
                            className="w-full cosmic-glow h-12 text-base"
                        >
                            {isEnabling || isLoading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Enabling...
                                </>
                            ) : (
                                <>
                                    <Bell className="h-5 w-5 mr-2" />
                                    Enable Notifications
                                </>
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            onClick={onSkip}
                            className="w-full text-muted-foreground hover:text-foreground"
                        >
                            <BellOff className="h-4 w-4 mr-2" />
                            Maybe Later
                        </Button>
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                        You can change this anytime in Settings → Notifications
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationPrompt;
