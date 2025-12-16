import React from "react";
import { Link, useLocation } from "react-router-dom";
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
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/dashboard") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        dashboard
                    </span>
                    <span className="text-xs font-bold">Home</span>
                </Link>



                {/* Loans */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/loans") || isActive("/admin/pledges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/loans"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/loans") || isActive("/admin/pledges") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        credit_score
                    </span>
                    <span className="text-xs font-bold">Loans</span>
                </Link>

                {/* Customers */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/customers") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/customers"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/customers") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        groups
                    </span>
                    <span className="text-xs font-bold">Customers</span>
                </Link>

                {/* Advanced Analysis */}
                {/* <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/analysis") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/analysis"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/analysis") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        analytics
                    </span>
                    <span className="text-xs font-bold text-center leading-none">Analysis</span>
                </Link> */}

                {/* Assign Tasks */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/tasks") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/tasks"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/tasks") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        assignment
                    </span>
                    <span className="text-xs font-bold text-center leading-none">Tasks</span>
                </Link>

                {/* Config */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/configs") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/configs"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/configs") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        tune
                    </span>
                    <span className="text-xs font-medium">Config</span>
                </Link>

            </div>
        </div>
    );
};

export default AdminBottomNavigation;
