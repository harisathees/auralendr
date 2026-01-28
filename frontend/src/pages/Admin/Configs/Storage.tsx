import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../../api/apiClient";
import { HardDrive, Building2, ChevronLeft } from "lucide-react";
import GoldCoinSpinner from "../../../components/GoldCoinSpinner";

interface BranchData {
    branch_name: string;
    count: number;
}

interface StorageData {
    branches: BranchData[];
    totalLoans: number;
    totalCapacity: number;
    overallPercentage: number;
}

const LOANS_PER_BRANCH = 4000;

const StoragePage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StorageData | null>(null);

    useEffect(() => {
        fetchStorageData();
    }, []);

    const fetchStorageData = async () => {
        try {
            // Try to get dashboard stats first
            let branchData: BranchData[] = [];

            try {
                const statsResponse = await api.get("/dashboard/stats");
                const branchDistribution = statsResponse.data.branch_distribution || [];
                branchData = branchDistribution.map((b: { branch_name: string; count: number }) => ({
                    branch_name: b.branch_name,
                    count: b.count || 0,
                }));
            } catch {
                // If dashboard stats fails, try to get branches list
                console.log("Dashboard stats not available, fetching branches directly");
            }

            // If no branch data from stats, fetch branches directly
            if (branchData.length === 0) {
                try {
                    const branchesResponse = await api.get("/branches");
                    const branches = branchesResponse.data || [];
                    branchData = branches.map((b: { branch_name: string }) => ({
                        branch_name: b.branch_name,
                        count: 0, // Assume 0 loans if no stats available
                    }));
                } catch {
                    console.log("Could not fetch branches");
                }
            }

            // Calculate totals - now we always have data (even if 0 branches)
            const totalLoans = branchData.reduce((sum, b) => sum + b.count, 0);
            const branchCount = branchData.length || 1; // At least 1 to avoid division by 0
            const totalCapacity = branchCount * LOANS_PER_BRANCH;
            const overallPercentage = branchCount > 0 ? Math.min((totalLoans / totalCapacity) * 100, 100) : 0;

            setData({
                branches: branchData,
                totalLoans,
                totalCapacity,
                overallPercentage,
            });
        } catch (error) {
            console.error("Failed to fetch storage data:", error);
            // Set default empty data instead of null
            setData({
                branches: [],
                totalLoans: 0,
                totalCapacity: LOANS_PER_BRANCH,
                overallPercentage: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const getColorClass = (percentage: number) => {
        if (percentage >= 80) return { bg: "bg-red-500", text: "text-red-600", ring: "ring-red-200 dark:ring-red-900/50" };
        if (percentage >= 60) return { bg: "bg-amber-500", text: "text-amber-600", ring: "ring-amber-200 dark:ring-amber-900/50" };
        return { bg: "bg-emerald-500", text: "text-emerald-600", ring: "ring-emerald-200 dark:ring-emerald-900/50" };
    };

    if (loading) {
        return <GoldCoinSpinner text="Loading Storage..." />;
    }

    if (!data) {
        // This should never happen now, but keep as safety net
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
                <HardDrive className="w-12 h-12 mb-4 opacity-50" />
                <p>Unable to load storage data</p>
            </div>
        );
    }

    const overallColor = getColorClass(data.overallPercentage);
    const circumference = 2 * Math.PI * 70;
    const strokeDashoffset = circumference - (data.overallPercentage / 100) * circumference;

    return (
        <div className="flex flex-col min-h-full pb-24">
            {/* Header */}
            <header className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-800">
                <Link
                    to="/admin/configurations"
                    className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-primary-text dark:text-white">Loan Storage</h1>
                    <p className="text-xs text-secondary-text dark:text-gray-400">
                        {data.branches.length} {data.branches.length === 1 ? 'Branch' : 'Branches'} × {LOANS_PER_BRANCH.toLocaleString()} capacity per branch
                    </p>
                </div>
            </header>

            <main className="flex-1 p-4 space-y-6">
                {/* Overall Storage Card */}
                <div className="bg-gradient-to-br from-slate-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Circular Progress */}
                        <div className="flex-shrink-0 flex flex-col items-center">
                            <div className="relative w-44 h-44">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="88"
                                        cy="88"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        className="text-gray-200 dark:text-gray-700"
                                    />
                                    <circle
                                        cx="88"
                                        cy="88"
                                        r="70"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        fill="transparent"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={strokeDashoffset}
                                        className={`${overallColor.text} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className={`text-4xl font-black ${overallColor.text}`}>
                                        {Math.round(data.overallPercentage)}%
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold mt-1">
                                        Overall Used
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex-1">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                        <Building2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Branches</span>
                                </div>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {data.branches.length}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Contributing to storage
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Branch-wise Storage */}
                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        Branch-wise Storage
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.branches.map((branch) => {
                            const branchPercentage = Math.min((branch.count / LOANS_PER_BRANCH) * 100, 100);
                            const branchColor = getColorClass(branchPercentage);

                            return (
                                <div
                                    key={branch.branch_name}
                                    className={`bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 ring-2 ${branchColor.ring} transition-all hover:shadow-md`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800 dark:text-white">
                                                    {branch.branch_name}
                                                </h3>
                                            </div>
                                        </div>
                                        <span className={`text-2xl font-black ${branchColor.text}`}>
                                            {Math.round(branchPercentage)}%
                                        </span>
                                    </div>

                                    <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${branchColor.bg} rounded-full transition-all duration-700 ease-out`}
                                            style={{ width: `${branchPercentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Legend */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Storage Status Legend</p>
                    <div className="flex flex-wrap gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">0-60% - Healthy</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">60-80% - Warning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">80-100% - Critical</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StoragePage;
