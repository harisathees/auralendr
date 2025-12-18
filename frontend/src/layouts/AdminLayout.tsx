import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminBottomNavigation from "../components/Shared/AdminBottomNavigation";
import GoldCoinSpinner from "../components/Shared/GoldCoinSpinner";

import { useAuth } from "../context/AuthContext";
import DeveloperBottomNavigation from "../components/Shared/DeveloperBottomNavigation";

const AdminLayout: React.FC = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="w-full h-[100dvh] relative bg-background-light dark:bg-background-dark shadow-xl overflow-hidden flex flex-col font-display">
                <div className="flex-1 overflow-y-auto relative no-scrollbar">
                    <Suspense fallback={<GoldCoinSpinner text="Loading..." />}>
                        <Outlet />
                    </Suspense>
                </div>
                {user?.role === 'developer' ? <DeveloperBottomNavigation /> : <AdminBottomNavigation />}
            </div>
        </div>
    );
};

export default AdminLayout;
