/// <reference lib="webworker" />
export type { };
declare const self: ServiceWorkerGlobalScope;

interface ExtendedNotificationOptions extends NotificationOptions {
    actions?: Array<{ action: string; title: string; icon?: string }>;
}

self.addEventListener('push', function (event: PushEvent) {
    if (!('Notification' in self && (self as any).Notification.permission === 'granted')) {
        return;
    }

    const payload = event.data ? event.data.json() : {};
    const title = payload.title || 'New Notification';
    const options: ExtendedNotificationOptions = {
        body: payload.body || 'You have a new update.',
        icon: payload.icon || '/assets/auralendr/auralendr.png',
        badge: '/assets/auralendr/auralendr-favicon.png',
        data: payload.data || {},
        actions: payload.actions || []
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event: NotificationEvent) {
    event.notification.close();

    const urlToOpen = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        self.clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then(function (clientList: readonly WindowClient[]) {
            // Check if there's already a tab open with this URL
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(urlToOpen) && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (self.clients.openWindow) {
                return self.clients.openWindow(urlToOpen);
            }
        })
    );
});
