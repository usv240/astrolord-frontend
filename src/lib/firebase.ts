// Firebase configuration for AstroLord
// This file initializes Firebase for push notifications and analytics

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';
import { createLogger } from '@/utils/logger';

const log = createLogger('Firebase');

// Firebase configuration from environment variables
// Falls back to hardcoded values for backwards compatibility
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Messaging instance (lazy-loaded)
let messaging: ReturnType<typeof getMessaging> | null = null;

/**
 * Get Firebase Messaging instance
 * Returns null if messaging is not supported in this browser
 */
export const getMessagingInstance = async () => {
    if (messaging) return messaging;

    try {
        const supported = await isSupported();
        if (!supported) {
            log.warn('Firebase Messaging is not supported in this browser');
            return null;
        }
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        log.error('Error initializing Firebase Messaging', { error: String(error) });
        return null;
    }
};

/**
 * VAPID key for web push notifications
 * From Firebase Console > Cloud Messaging > Web Push certificates
 */
export const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 * @returns FCM token string or null if permission denied/not supported
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            log.warn('Notifications are not supported in this browser');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            log.info('Notification permission denied');
            return null;
        }

        // Get messaging instance
        const messagingInstance = await getMessagingInstance();
        if (!messagingInstance) {
            return null;
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

        // Get FCM token
        const token = await getToken(messagingInstance, {
            vapidKey: VAPID_KEY,
            serviceWorkerRegistration: registration
        });

        log.debug('FCM Token obtained', { token: token?.substring(0, 20) + '...' });
        return token;
    } catch (error) {
        log.error('Error requesting notification permission', { error: String(error) });
        return null;
    }
};

/**
 * Listen for foreground messages
 * @param callback Function to call when a message is received
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
    getMessagingInstance().then(messagingInstance => {
        if (messagingInstance) {
            onMessage(messagingInstance, (payload) => {
                log.debug('Foreground message received', { payload });
                callback(payload);
            });
        }
    });
};

export { app };
