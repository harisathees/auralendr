import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../../../../api/apiClient";
import {
    LayoutDashboard,
    CreditCard,
    Users,
    TrendingUp,
    Settings2,
    AlertCircle
} from "lucide-react";

const AdminBottomNavigation: React.FC = () => {
    const location = useLocation();
    const [pendingCount, setPendingCount] = useState(0);

    const fetchPendingCount = async () => {
        try {
            const res = await api.get("/approvals");
            setPendingCount(res.data.total || res.data.data?.length || 0);
        } catch (error) {
            console.error("Failed to fetch pending approvals count", error);
        }
    };

    useEffect(() => {
        fetchPendingCount();
        const interval = setInterval(fetchPendingCount, 60 * 60 * 1000); // Refresh every 1 hour
        return () => clearInterval(interval);
    }, []);

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg pb-safe">
            <div className="flex justify-between items-center h-[76px] px-2 md:px-4">

                {/* Home */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors ${isActive("/admin/dashboard") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/dashboard"
                >
                    <LayoutDashboard
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill={isActive("/admin/dashboard") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/dashboard") ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-bold">Home</span>
                </Link>

                {/* Approvals */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors relative ${isActive("/admin/approvals") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/approvals"
                >
                    {pendingCount > 0 && (
                        <span className="absolute -top-1 right-1 md:right-2 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white dark:ring-gray-900 animate-bounce">
                            {pendingCount}
                        </span>
                    )}
                    <AlertCircle
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill={isActive("/admin/approvals") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/approvals") ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-bold">Approve</span>
                </Link>

                {/* Loans */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors ${isActive("/admin/loans") || isActive("/admin/pledges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/loans"
                >
                    <CreditCard
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill={isActive("/admin/loans") || isActive("/admin/pledges") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/loans") || isActive("/admin/pledges") ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-bold">Loans</span>
                </Link>

                {/* Customers */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors ${isActive("/admin/customers") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/customers"
                >
                    <Users
                        className="w-6 h-6 md:w-7 md:h-7"
                        fill={isActive("/admin/customers") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/customers") ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-bold">Customers</span>
                </Link>

                {/* Cashflow */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors ${isActive("/admin/cashflow") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/cashflow"
                >
                    <TrendingUp
                        className="w-6 h-6 md:w-7 md:h-7"
                        strokeWidth={isActive("/admin/cashflow") ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-bold">Cash</span>
                </Link>

                {/* Config */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors ${isActive("/admin/configs") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/configs"
                >
                    <Settings2
                        className="w-6 h-6 md:w-7 md:h-7"
                        strokeWidth={isActive("/admin/configs") ? 2.5 : 2}
                    />
                    <span className="text-[10px] md:text-xs font-bold">Config</span>
                </Link>

            </div>
        </div>
    );
};

export default AdminBottomNavigation;
