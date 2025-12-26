import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import StaffBottomNavigation from "../components/Shared/Navigation/StaffNavigation/StaffBottomNavigation";
import AdminBottomNavigation from "../components/Shared/Navigation/AdminNavigation/AdminBottomNavigation";
import DeveloperBottomNavigation from "../components/Shared/Navigation/DeveloperNavigation/DeveloperBottomNavigation";
import GoldCoinSpinner from "../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner";
import { useAuth } from "../context/Auth/AuthContext";

const DashboardLayout: React.FC = () => {
    const { user } = useAuth();

    const renderBottomNavigation = () => {
        if (user?.role === 'developer') {
            return <DeveloperBottomNavigation />;
        }
        if (user?.role === 'admin') {
            return <AdminBottomNavigation />;
        }
        return <StaffBottomNavigation />;
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark relative flex flex-col font-display pb-24">
            <Suspense fallback={<GoldCoinSpinner text="Loading..." />}>
                <Outlet />
            </Suspense>
            {renderBottomNavigation()}
        </div>
    );
};

export default DashboardLayout;
