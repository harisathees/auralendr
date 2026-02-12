import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../../../api/apiClient";
import {
    LayoutDashboard,
    CreditCard,
    Users,
    TrendingUp,
    AlertCircle,
    Plus,
    Tag,
    RotateCw,
    Shield
} from "lucide-react";

import { useAuth } from "../../../../context/Auth/AuthContext";

const AdminBottomNavigation: React.FC = () => {
    const { enableTransactions, noBranchMode, enableBankPledge, enableApprovals } = useAuth();
    const location = useLocation();
    const [pendingCount, setPendingCount] = useState(0);
    const [fabOpen, setFabOpen] = useState(false);
    const navigate = useNavigate();

    const toggleFab = () => {
        setFabOpen(!fabOpen);
    };

    const closeFab = () => {
        setFabOpen(false);
    };

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

    // If noBranchMode is NOT enabled, render the standard flat navigation
    if (!noBranchMode) {
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
                    {enableApprovals && (
                        <Link
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative ${isActive("/admin/approvals") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"}`}
                            to="/admin/approvals"
                        >
                            {pendingCount > 0 && (
                                <span className="absolute -top-1 right-1 md:right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                    {pendingCount}
                                </span>
                            )}
                            <AlertCircle className={`w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 ${isActive("/admin/approvals") ? "scale-110" : ""}`} />
                            <span className="text-[10px] md:text-xs font-bold">Approve</span>
                        </Link>
                    )}

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
                    {enableTransactions && (
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
                    )}

                    {/* Privileges */}
                    <Link
                        className={`flex flex-col items-center gap-1 min-w-[3rem] md:min-w-[3.5rem] transition-colors ${isActive("/privileges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                            }`}
                        to="/privileges"
                    >
                        <Shield
                            className="w-6 h-6 md:w-7 md:h-7"
                            strokeWidth={isActive("/privileges") ? 2.5 : 2}
                        />
                        <span className="text-[10px] md:text-xs font-bold">Privileges</span>
                    </Link>

                </div>
            </div>
        );
    }

    // Render with FAB if noBranchMode is enabled
    return (
        <>
            {/* Nav Container with SVG Background for Curve */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-transparent font-display pointer-events-none">

                {/* Full Width Background Layer - Composite */}
                <div className="absolute bottom-0 inset-x-0 h-24 flex items-end justify-center drop-shadow-2xl z-0 pointer-events-auto overflow-hidden">
                    <div className="flex-1 h-[76px] bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:border-t-0" />
                    <div className="w-[375px] min-w-[375px] h-24 shrink-0 relative">
                        <svg
                            viewBox="0 0 375 96"
                            className="w-full h-full"
                        >
                            <path
                                d="M0,20 L152.5,20 C152.5,45 167.5,65 187.5,65 C207.5,65 222.5,45 222.5,20 L375,20 L375,96 L0,96 Z"
                                className="fill-card-light dark:fill-gray-900"
                            />
                            <path
                                d="M0,20 L152.5,20 C152.5,45 167.5,65 187.5,65 C207.5,65 222.5,45 222.5,20 L375,20"
                                className="stroke-gray-200 dark:stroke-gray-700"
                                strokeWidth="1"
                                fill="none"
                            />
                        </svg>
                        {/* Cover adjacent borders if needed */}
                        <div className="absolute top-[20px] -left-1 w-2 h-2 bg-card-light dark:bg-gray-900 z-10" />
                        <div className="absolute top-[20px] -right-1 w-2 h-2 bg-card-light dark:bg-gray-900 z-10" />
                    </div>
                    <div className="flex-1 h-[76px] bg-card-light dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:border-t-0" />
                </div>

                {/* Content Container - Centered and Interactive */}
                <div className="relative w-full flex justify-center z-10 pointer-events-auto">
                    <div className="w-full max-w-lg grid grid-cols-5 items-end h-24 px-2 pb-6">

                        {/* Home */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/admin/dashboard") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
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

                        {/* Customers */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/admin/customers") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
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

                        <div className="relative flex justify-center items-end h-full group -top-4">
                            {/* FAB Menu */}
                            <div
                                className={`absolute bottom-24 left-1/2 -translate-x-1/2 flex items-center gap-4 transition-all duration-300 transform origin-bottom ${fabOpen ? "scale-100 opacity-100" : "scale-0 opacity-0"
                                    }`}
                            >
                                {/* Create Pledge */}
                                <button
                                    onClick={() => {
                                        navigate("/pledges/create");
                                        closeFab();
                                    }}
                                    className="flex flex-col items-center gap-2 group/btn"
                                >
                                    <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-800 text-primary border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-lg group-hover/btn:bg-primary group-hover/btn:text-white transition-colors">
                                        <Tag className="w-6 h-6" />
                                    </div>
                                    <span className="text-xs font-bold text-primary-text dark:text-white bg-card-light dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                                        Create Pledge
                                    </span>
                                </button>

                                {/* Create Bank Pledge */}
                                {enableBankPledge && (
                                    <button
                                        onClick={() => {
                                            navigate("/re-pledge/create");
                                            closeFab();
                                        }}
                                        className="flex flex-col items-center gap-2 group/btn">
                                        <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-800 text-purple-600 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-lg group-hover/btn:bg-purple-600 group-hover/btn:text-white transition-colors">
                                            <RotateCw className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-bold text-primary-text dark:text-white bg-card-light dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                                            Create Bank Pledge
                                        </span>
                                    </button>
                                )}
                            </div>

                            {/* FAB Button */}
                            <button
                                onClick={() => {
                                    if (!enableBankPledge) {
                                        navigate("/pledges/create");
                                    } else {
                                        toggleFab();
                                    }
                                }}
                                className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(0,200,83,0.4)]"
                            >
                                <Plus
                                    className="w-8 h-8 transition-transform duration-300"
                                    style={{ transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                                />
                            </button>
                        </div>

                        {/* Loans */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/admin/loans") || isActive("/admin/pledges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
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

                        {/* Privileges */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/privileges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                                }`}
                            to="/privileges"
                        >
                            <Shield
                                className="w-6 h-6 md:w-7 md:h-7"
                                fill={isActive("/privileges") ? "currentColor" : "none"}
                                strokeWidth={isActive("/privileges") ? 2.5 : 2}
                            />
                            <span className="text-[10px] md:text-xs font-bold">Privileges</span>
                        </Link>

                    </div>
                </div>
            </div>

            {/* Click outside to close FAB */}
            {fabOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={closeFab}
                />
            )}
        </>
    );
};

export default AdminBottomNavigation;
