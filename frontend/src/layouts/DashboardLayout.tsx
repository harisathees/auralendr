import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import BottomNavigation from "../components/Shared/BottomNavigation";
import GoldCoinSpinner from "../components/Shared/GoldCoinSpinner";

const DashboardLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark">
            <div className="w-full h-[100dvh] relative bg-background-light dark:bg-background-dark shadow-xl overflow-hidden flex flex-col font-display">
                <div className="flex-1 overflow-hidden relative">
                    <Suspense fallback={<GoldCoinSpinner text="Loading..." />}>
                        <Outlet />
                    </Suspense>
                </div>
                <BottomNavigation />
            </div>
        </div>
    );
};

export default DashboardLayout;
