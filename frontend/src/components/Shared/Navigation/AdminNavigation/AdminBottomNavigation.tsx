import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    CreditCard,
    Users,
    TrendingUp,
    ClipboardList,
    Settings2
} from "lucide-react";
// import { useAuth } from "../../context/AuthContext";

const AdminBottomNavigation: React.FC = () => {
    const location = useLocation();

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg pb-safe">
            <div className="flex justify-between items-center h-[76px] px-4">

                {/* Home */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/dashboard") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/dashboard"
                >
                    <LayoutDashboard
                        className="w-7 h-7"
                        fill={isActive("/admin/dashboard") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/dashboard") ? 2.5 : 2}
                    />
                    <span className="text-xs font-bold">Home</span>
                </Link>



                {/* Loans */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/loans") || isActive("/admin/pledges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/loans"
                >
                    <CreditCard
                        className="w-7 h-7"
                        fill={isActive("/admin/loans") || isActive("/admin/pledges") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/loans") || isActive("/admin/pledges") ? 2.5 : 2}
                    />
                    <span className="text-xs font-bold">Loans</span>
                </Link>

                {/* Customers */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/customers") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/customers"
                >
                    <Users
                        className="w-7 h-7"
                        fill={isActive("/admin/customers") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/customers") ? 2.5 : 2}
                    />
                    <span className="text-xs font-bold">Customers</span>
                </Link>

                {/* Cashflow */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/cashflow") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/cashflow"
                >
                    <TrendingUp
                        className="w-7 h-7"
                        // fill={isActive("/admin/cashflow") ? "currentColor" : "none"} // TrendingUp doesn't fill nicely usually
                        strokeWidth={isActive("/admin/cashflow") ? 2.5 : 2}
                    />
                    <span className="text-xs font-bold">Cashflow</span>
                </Link>



                {/* Assign Tasks */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/tasks") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/tasks"
                >
                    <ClipboardList
                        className="w-7 h-7"
                        fill={isActive("/admin/tasks") ? "currentColor" : "none"}
                        strokeWidth={isActive("/admin/tasks") ? 2.5 : 2}
                    />
                    <span className="text-xs font-bold text-center leading-none">Tasks</span>
                </Link>

                {/* Config */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/configs") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/configs"
                >
                    <Settings2
                        className="w-7 h-7"
                        // Settings2 doesn't fill nicely
                        strokeWidth={isActive("/admin/configs") ? 2.5 : 2}
                    />
                    <span className="text-xs font-medium">Config</span>
                </Link>

            </div>
        </div>
    );
};

export default AdminBottomNavigation;
