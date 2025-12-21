import React from "react";
import { Link, useLocation } from "react-router-dom";

const DeveloperBottomNavigation: React.FC = () => {
    const location = useLocation();

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg pb-safe">
            <div className="flex justify-around items-center h-[76px] px-4">

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

                {/* User Control */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/configs/users") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/configs/users"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/configs/users") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        manage_accounts
                    </span>
                    <span className="text-xs font-bold">Users</span>
                </Link>

                {/* Branch Control */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/configs/branches") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/configs/branches"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/configs/branches") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        store
                    </span>
                    <span className="text-xs font-bold">Branches</span>
                </Link>

                {/* User Privilege */}
                <Link
                    className={`flex flex-col items-center gap-1 min-w-[3.5rem] transition-colors ${isActive("/admin/configs/roles") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                        }`}
                    to="/admin/configs/roles"
                >
                    <span className="material-symbols-outlined text-3xl" style={isActive("/admin/configs/roles") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                        admin_panel_settings
                    </span>
                    <span className="text-xs font-bold text-center leading-none">Privileges</span>
                </Link>

            </div>
        </div>
    );
};

export default DeveloperBottomNavigation;
