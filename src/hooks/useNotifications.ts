/**
 * Custom hook for managing push notifications
 * Handles permission requests, token registration, and preferences
 */

import { useState, useEffect, useCallback } from 'react';
import { notificationAPI } from '@/lib/api';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { toast } from 'sonner';
import { trackNotificationEnabled, trackNotificationDisabled } from '@/lib/analytics';
import { createLogger } from '@/utils/logger';

const log = createLogger('useNotifications');

export interface NotificationPreferences {
    enabled: boolean;
    daily_forecast: boolean;
    quota_warnings: boolean;
    subscription_expiry: boolean;
    special_events: boolean;
    re_engagement: boolean;
}

const defaultPreferences: NotificationPreferences = {
    enabled: false,
    daily_forecast: true,
    quota_warnings: true,
    subscription_expiry: true,
    special_events: true,
    re_engagement: false
};

export type PermissionStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export function useNotifications() {
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('default');
    const [isLoading, setIsLoading] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
    const [isSupported, setIsSupported] = useState(true);

    // Check if notifications are supported
    useEffect(() => {
        if (!('Notification' in window) || !('serviceWorker' in navigator)) {
            setIsSupported(false);
            setPermissionStatus('unsupported');
            return;
        }

        // Get current permission status
        setPermissionStatus(Notification.permission as PermissionStatus);
    }, []);

    // Load preferences from backend
    const loadPreferences = useCallback(async () => {
        try {
            const response = await notificationAPI.getPreferences();
            if (response.data?.success && response.data?.preferences) {
                setPreferences(response.data.preferences);
            }
        } catch (error) {
            log.error('Failed to load notification preferences', { error: String(error) });
        }
    }, []);

    // Load preferences on mount if permission is granted
    useEffect(() => {
        if (permissionStatus === 'granted') {
            loadPreferences();
        }
    }, [permissionStatus, loadPreferences]);

    // Listen for foreground messages
    useEffect(() => {
        if (permissionStatus === 'granted') {
            onForegroundMessage((payload) => {
                // Show toast for foreground notifications
                toast(payload.notification?.title || 'Notification', {
                    description: payload.notification?.body,
                    action: payload.data?.click_action ? {
                        label: 'View',
                        onClick: () => window.location.href = payload.data.click_action
                    } : undefined
                });
            });
        }
    }, [permissionStatus]);

    // Request notification permission
    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!isSupported) {
            toast.error('Notifications are not supported in this browser');
            return false;
        }

        setIsLoading(true);
        try {
            const token = await requestNotificationPermission();

            if (token) {
                // Register token with backend
                const deviceInfo = {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    language: navigator.language,
                    timestamp: new Date().toISOString()
                };

                await notificationAPI.registerToken(token, deviceInfo);

                setPermissionStatus('granted');
                setPreferences(prev => ({ ...prev, enabled: true }));
                toast.success('Notifications enabled!', {
                    description: 'You\'ll receive personalized cosmic updates'
                });

                // Load full preferences
                await loadPreferences();

                // Track notification enabled
                trackNotificationEnabled();
                return true;
            } else {
                setPermissionStatus(Notification.permission as PermissionStatus);
                if (Notification.permission === 'denied') {
                    toast.error('Notification permission denied', {
                        description: 'You can enable notifications in browser settings'
                    });
                }
                return false;
            }
        } catch (error) {
            log.error('Error requesting notification permission', { error: String(error) });
            toast.error('Failed to enable notifications');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [isSupported, loadPreferences]);

    // Update notification preferences
    const updatePreferences = useCallback(async (newPrefs: Partial<NotificationPreferences>) => {
        setIsLoading(true);
        try {
            await notificationAPI.updatePreferences(newPrefs);
            setPreferences(prev => ({ ...prev, ...newPrefs }));
            toast.success('Preferences updated');
        } catch (error) {
            log.error('Failed to update preferences', { error: String(error) });
            toast.error('Failed to update preferences');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Disable all notifications
    const disableNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            await notificationAPI.disableNotifications();
            setPreferences(prev => ({ ...prev, enabled: false }));
            // Update permission status to reflect disabled state in UI
            setPermissionStatus('default');

            // Track notification disabled
            trackNotificationDisabled();
            toast.success('Notifications disabled');
        } catch (error) {
            log.error('Failed to disable notifications', { error: String(error) });
            toast.error('Failed to disable notifications');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Send test notification
    const sendTestNotification = useCallback(async (type: string = 'daily_forecast', chartId?: string) => {
        setIsLoading(true);
        try {
            const response = await notificationAPI.testNotification(type, chartId);
            if (response.data?.success) {
                // Show the generated notification content as a toast
                const notification = response.data.notification;
                toast.success(notification?.title || 'Test Notification', {
                    description: notification?.body || 'Notification generated successfully'
                });
            }
        } catch (error) {
            log.error('Failed to send test notification', { error: String(error) });
            toast.error('Failed to generate test notification');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        // Status
        permissionStatus,
        isSupported,
        isLoading,
        isEnabled: preferences.enabled && permissionStatus === 'granted',

        // Preferences
        preferences,

        // Actions
        requestPermission,
        updatePreferences,
        disableNotifications,
        sendTestNotification,
        refreshPreferences: loadPreferences
    };
}

export default useNotifications;
