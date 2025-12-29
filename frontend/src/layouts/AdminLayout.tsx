import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AdminBottomNavigation from "../components/Shared/Navigation/AdminNavigation/AdminBottomNavigation";
import GoldCoinSpinner from "../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";

import { useAuth } from "../context/Auth/AuthContext";
import DeveloperBottomNavigation from "../components/Shared/Navigation/DeveloperNavigation/DeveloperBottomNavigation";

const AdminLayout: React.FC = () => {
    const { user } = useAuth();

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
