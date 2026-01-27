// Firebase Cloud Messaging Service Worker
// This handles background push notifications when the app is not in focus
//
// NOTE: Service workers cannot access Vite environment variables at runtime.
// These values must be hardcoded here. Update them if your Firebase project changes.

importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Firebase config - UPDATE THESE VALUES if your Firebase project changes
const firebaseConfig = {
    apiKey: "AIzaSyBK16JX-TSlDy26uUi0aZR5M0pwR8v-jyw",
    authDomain: "astrolord-5816a.firebaseapp.com",
    projectId: "astrolord-5816a",
    storageBucket: "astrolord-5816a.firebasestorage.app",
    messagingSenderId: "776238367032",
    appId: "1:776238367032:web:8f1d7287516b80762f81cd"
};

// Initialize Firebase in the service worker
firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message:', payload);

    const notificationTitle = payload.notification?.title || 'AstroLord';
    const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/logo.png',
        badge: '/favicon.png',
        tag: payload.data?.tag || 'astrolord-notification',
        data: payload.data || {},
        actions: [
            {
                action: 'open',
                title: 'Open App'
            },
            {
                action: 'dismiss',
                title: 'Dismiss'
            }
        ],
        requireInteraction: payload.data?.requireInteraction === 'true',
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('[firebase-messaging-sw.js] Notification click:', event);

    event.notification.close();

    // Handle action buttons
    if (event.action === 'dismiss') {
        return;
    }

    // Default action - open the app
    const urlToOpen = event.notification.data?.click_action || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if app is already open
            for (const client of clientList) {
                if (client.url.includes(self.registration.scope) && 'focus' in client) {
                    client.focus();
                    if (urlToOpen && urlToOpen !== '/') {
                        client.navigate(urlToOpen);
                    }
                    return;
                }
            }
            // Open new window if app is not open
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Handle push events (fallback for non-FCM push)
self.addEventListener('push', (event) => {
    if (event.data) {
        try {
            const payload = event.data.json();
            // FCM will handle this via onBackgroundMessage
            console.log('[firebase-messaging-sw.js] Push event received:', payload);
        } catch (e) {
            // Plain text push
            console.log('[firebase-messaging-sw.js] Push text:', event.data.text());
        }
    }
});

console.log('[firebase-messaging-sw.js] Service worker loaded');
