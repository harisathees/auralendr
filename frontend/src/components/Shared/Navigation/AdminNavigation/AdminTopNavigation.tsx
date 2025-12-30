import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Store, Users, LogOut } from "lucide-react";
import { useAuth } from "../../../../context/Auth/AuthContext";

const AdminNavigation: React.FC = () => {
    const { logout } = useAuth();
    const location = useLocation();

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 h-16 flex items-center justify-around shadow-lg">
            {/* Dashboard */}
            <Link
                className={`flex flex-col items-center gap-1 transition-colors ${isActive("/admin/dashboard") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                    }`}
                to="/admin/dashboard"
            >
                <LayoutDashboard
                    className="w-6 h-6"
                    fill={isActive("/admin/dashboard") ? "currentColor" : "none"}
                />
                <span className="text-xs font-bold">Dashboard</span>
            </Link>

            {/* Branches */}
            <Link
                className={`flex flex-col items-center gap-1 transition-colors ${isActive("/admin/configs/branches") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                    }`}
                to="/admin/configs/branches"
            >
                <Store
                    className="w-6 h-6"
                    fill={isActive("/admin/configs/branches") ? "currentColor" : "none"}
                />
                <span className="text-xs font-medium">Branches</span>
            </Link>

            {/* Users */}
            <Link
                className={`flex flex-col items-center gap-1 transition-colors ${isActive("/admin/configs/users") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                    }`}
                to="/admin/configs/users"
            >
                <Users
                    className="w-6 h-6"
                    fill={isActive("/admin/configs/users") ? "currentColor" : "none"}
                />
                <span className="text-xs font-medium">Staff</span>
            </Link>

            {/* Logout */}
            <button
                onClick={logout}
                className="flex flex-col items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
            >
                <LogOut className="w-6 h-6" />
                <span className="text-xs font-medium">Logout</span>
            </button>
        </div>
    );
};

export default AdminNavigation;
