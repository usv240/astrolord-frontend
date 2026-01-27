// Firebase configuration for AstroLord
// This file initializes Firebase for push notifications and analytics

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

// Firebase configuration - these are public client-side values (not secrets)
const firebaseConfig = {
    apiKey: "AIzaSyBK16JX-TSlDy26uUi0aZR5M0pwR8v-jyw",
    authDomain: "astrolord-5816a.firebaseapp.com",
    projectId: "astrolord-5816a",
    storageBucket: "astrolord-5816a.firebasestorage.app",
    messagingSenderId: "776238367032",
    appId: "1:776238367032:web:8f1d7287516b80762f81cd",
    measurementId: "G-8LTTZHTG43"
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
            console.warn('Firebase Messaging is not supported in this browser');
            return null;
        }
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('Error initializing Firebase Messaging:', error);
        return null;
    }
};

/**
 * VAPID key for web push notifications
 * From Firebase Console > Cloud Messaging > Web Push certificates
 */
export const VAPID_KEY = 'BC7W5JG77rAKE9_JbKr3BYI5yitSKy_OewdBdCSkIjb7mcXLxsNufx-H7bbnD2QbBODTEweE5jT2bbi4t-UqB8M';

/**
 * Request notification permission and get FCM token
 * @returns FCM token string or null if permission denied/not supported
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
    try {
        // Check if notifications are supported
        if (!('Notification' in window)) {
            console.warn('Notifications are not supported in this browser');
            return null;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
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

        console.log('FCM Token obtained:', token?.substring(0, 20) + '...');
        return token;
    } catch (error) {
        console.error('Error requesting notification permission:', error);
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
                console.log('Foreground message received:', payload);
                callback(payload);
            });
        }
    });
};

export { app };
