import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminBottomNavigation from "../components/Shared/Navigation/AdminNavigation/AdminBottomNavigation";
import GoldCoinSpinner from "../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

import { useAuth } from "../context/Auth/AuthContext";
import DeveloperBottomNavigation from "../components/Shared/Navigation/DeveloperNavigation/DeveloperBottomNavigation";

const AdminLayout: React.FC = () => {
    const { user } = useAuth();

    // Web Push Logic
    React.useEffect(() => {
        if (!user || !['admin', 'superadmin'].includes(user.role)) return;

        const subscribeToPush = async () => {
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                try {
                    // Wait for the service worker registered by vite-plugin-pwa
                    const registration = await navigator.serviceWorker.ready;
                    console.log('Service Worker ready:', registration);

                    // Fetch VAPID Public Key
                    const { data: { key } } = await import("../api/apiClient").then(m => m.default.get('/push/vapid-public-key'));
                    if (!key) throw new Error("No VAPID key found");

                    // Convert key
                    const urlBase64ToUint8Array = (base64String: string) => {
                        const padding = '='.repeat((4 - base64String.length % 4) % 4);
                        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
                        const rawData = window.atob(base64);
                        const outputArray = new Uint8Array(rawData.length);
                        for (let i = 0; i < rawData.length; ++i) {
                            outputArray[i] = rawData.charCodeAt(i);
                        }
                        return outputArray;
                    };

                    // Check subscription
                    let subscription = await registration.pushManager.getSubscription();
                    if (!subscription) {
                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: urlBase64ToUint8Array(key)
                        });
                    }

                    // Send subscription to backend
                    if (subscription) {
                        await import("../api/apiClient").then(m => m.default.post('/push/subscribe', subscription));
                        console.log("Push Notification Subscribed!");
                    }

                } catch (error) {
                    console.error("Push Registration failed:", error);
                }
            }
        };

        subscribeToPush();
    }, [user]);

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark relative flex flex-col font-display pb-24">
            <Suspense fallback={<GoldCoinSpinner text="Loading..." />}>
                <Outlet />
            </Suspense>
            {user?.role === 'developer' ? <DeveloperBottomNavigation /> : <AdminBottomNavigation />}
        </div>
    );
};

export default AdminLayout;
