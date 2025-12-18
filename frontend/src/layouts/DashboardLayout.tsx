import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import StaffBottomNavigation from "../components/Shared/StaffBottomNavigation";
import AdminBottomNavigation from "../components/Shared/AdminBottomNavigation";
import DeveloperBottomNavigation from "../components/Shared/DeveloperBottomNavigation";
import GoldCoinSpinner from "../components/Shared/GoldCoinSpinner";
import { useAuth } from "../context/AuthContext";

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
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="w-full h-[100dvh] relative bg-background-light dark:bg-background-dark shadow-xl overflow-hidden flex flex-col font-display">
                <div className="flex-1 overflow-hidden relative">
                    <Suspense fallback={<GoldCoinSpinner text="Loading..." />}>
                        <Outlet />
                    </Suspense>
                </div>
                {renderBottomNavigation()}
            </div>
        </div>
    );
};

export default DashboardLayout;
