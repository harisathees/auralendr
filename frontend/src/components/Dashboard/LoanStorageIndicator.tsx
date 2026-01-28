import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { HardDrive, Building2 } from "lucide-react";

interface BranchDistribution {
    branch_name: string;
    count: number;
    total_amount: number;
}

interface StorageData {
    branches: BranchDistribution[];
    totalLoans: number;
    totalCapacity: number;
    overallPercentage: number;
}

const LOANS_PER_BRANCH = 4000;

const LoanStorageIndicator: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StorageData | null>(null);

    useEffect(() => {
        fetchStorageData();
    }, []);

    const fetchStorageData = async () => {
        try {
            const response = await api.get("/dashboard/stats");
            const branchDistribution: BranchDistribution[] = response.data.branch_distribution || [];

            const totalLoans = branchDistribution.reduce((sum, b) => sum + b.count, 0);
            const branchCount = branchDistribution.length || 1;
            const totalCapacity = branchCount * LOANS_PER_BRANCH;
            const overallPercentage = Math.min((totalLoans / totalCapacity) * 100, 100);

            setData({
                branches: branchDistribution,
                totalLoans,
                totalCapacity,
                overallPercentage,
            });
        } catch (error) {
            console.error("Failed to fetch storage data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getColorClass = (percentage: number) => {
        if (percentage >= 80) return { bg: "bg-red-500", text: "text-red-600", light: "bg-red-100 dark:bg-red-900/30" };
        if (percentage >= 60) return { bg: "bg-amber-500", text: "text-amber-600", light: "bg-amber-100 dark:bg-amber-900/30" };
        return { bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-100 dark:bg-emerald-900/30" };
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse">
                <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            </div>
        );
    }

    if (!data || data.branches.length === 0) {
        return null;
    }

    const overallColor = getColorClass(data.overallPercentage);
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (data.overallPercentage / 100) * circumference;

    return (
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">Loan Storage</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {data.branches.length} {data.branches.length === 1 ? 'Branch' : 'Branches'} × {LOANS_PER_BRANCH.toLocaleString()} capacity
                </span>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Circular Progress */}
                <div className="flex-shrink-0 flex flex-col items-center justify-center">
                    <div className="relative w-28 h-28">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="56"
                                cy="56"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                                cx="56"
                                cy="56"
                                r="45"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="transparent"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                className={`${overallColor.text} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`text-2xl font-black ${overallColor.text}`}>
                                {Math.round(data.overallPercentage)}%
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium">
                                Used
                            </span>
                        </div>
                    </div>
                </div>

                {/* Branch Breakdown */}
                <div className="flex-1 space-y-3">
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        Branch Breakdown
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {data.branches.map((branch) => {
                            const branchPercentage = Math.min((branch.count / LOANS_PER_BRANCH) * 100, 100);
                            const branchColor = getColorClass(branchPercentage);

                            return (
                                <div key={branch.branch_name} className="bg-white dark:bg-gray-800/50 rounded-xl p-3 border border-gray-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">
                                            {branch.branch_name}
                                        </span>
                                        <span className={`text-sm font-bold ${branchColor.text}`}>
                                            {Math.round(branchPercentage)}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
            </div>
        </div>
    );
};

export default LoanStorageIndicator;
