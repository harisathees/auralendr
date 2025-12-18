import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context";


const BottomNavigation: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [fabOpen, setFabOpen] = useState(false);

    const toggleFab = () => {
        setFabOpen(!fabOpen);
    };

    const closeFab = () => {
        setFabOpen(false);
    };

    // Helper to check active state
    const isActive = (path: string) => location.pathname === path;

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
                    <div className="w-full max-w-md grid grid-cols-5 items-end h-24 px-2 pb-6">

                        {/* Home */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/dashboard") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                                }`}
                            to="/dashboard"
                        >
                            <span className="material-symbols-outlined" style={isActive("/dashboard") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                dashboard
                            </span>
                            <span className="text-xs font-bold">Home</span>
                        </Link>

                        {/* Loans (Includes Repledges tab) */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/pledges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                                }`}
                            to="/pledges"
                        >
                            <span className="material-symbols-outlined" style={isActive("/pledges") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                credit_score
                            </span>
                            <span className="text-xs font-bold">Loans</span>
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
                                        <span className="material-symbols-outlined">local_offer</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary-text dark:text-white bg-card-light dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                                        Create Pledge
                                    </span>
                                </button>

                                {/* Create Repledge */}
                                <button
                                    onClick={() => {
                                        navigate("/re-pledge/create");
                                        closeFab();
                                    }}
                                    className="flex flex-col items-center gap-2 group/btn">
                                    <div className="h-14 w-14 rounded-full bg-white dark:bg-gray-800 text-purple-600 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-lg group-hover/btn:bg-purple-600 group-hover/btn:text-white transition-colors">
                                        <span className="material-symbols-outlined">autorenew</span>
                                    </div>
                                    <span className="text-xs font-bold text-primary-text dark:text-white bg-card-light dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm whitespace-nowrap">
                                        Create Repledge
                                    </span>
                                </button>
                            </div>

                            {/* FAB Button */}
                            <button
                                onClick={toggleFab}
                                className="h-14 w-14 rounded-full bg-primary text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(0,200,83,0.4)]"
                            >
                                <span
                                    className="material-symbols-outlined text-3xl transition-transform duration-300"
                                    style={{ transform: fabOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                                >
                                    add
                                </span>
                            </button>
                        </div>

                        {/* Transactions */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/transactions") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                                }`}
                            to="/transactions"
                        >
                            <span className="material-symbols-outlined" style={isActive("/transactions") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                receipt_long
                            </span>
                            <span className="text-xs font-bold">Transactions</span>
                        </Link>

                        {/* Privileges (Includes Notice printing link) */}
                        <Link
                            className={`flex flex-col items-center gap-1 transition-colors ${isActive("/privileges") ? "text-primary" : "text-secondary-text dark:text-gray-400 hover:text-primary"
                                }`}
                            to="/privileges"
                        >
                            <span className="material-symbols-outlined" style={isActive("/privileges") ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                security
                            </span>
                            <span className="text-xs font-bold">Privileges</span>
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

export default BottomNavigation;
