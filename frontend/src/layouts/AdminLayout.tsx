import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminBottomNavigation from "../components/Shared/AdminBottomNavigation";
import GoldCoinSpinner from "../components/Shared/GoldCoinSpinner";

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="w-full h-[100dvh] relative bg-background-light dark:bg-background-dark shadow-xl overflow-hidden flex flex-col font-display">
                <div className="flex-1 overflow-hidden relative">
                    <Suspense fallback={<GoldCoinSpinner text="Loading..." />}>
                        <Outlet />
                    </Suspense>
                </div>
                <AdminBottomNavigation />
            </div>
        </div>
    );
};

export default AdminLayout;
