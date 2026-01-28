import React, { useState, useEffect } from "react";
import { TrendingUp, Users, Wallet, Building2 } from "lucide-react";
import api from "../../api/apiClient";

interface Props {
    filters?: { branch_id?: number; start_date?: string; end_date?: string };
}

const BusinessOverviewDashboard: React.FC<Props> = ({ filters = {} }) => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [filters]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await api.get("/dashboard/stats", { params: filters });
            setStats(response.data?.business_stats);
        } catch (error) {
            console.error("Error fetching business stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Turnover</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {loading ? "..." : formatCurrency(stats?.turnover)}
                        </h3>
                    </div>
                </div>


                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Net Profit</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {loading ? "..." : formatCurrency(stats?.net_profit)}
                        </h3>
                    </div>
                </div>


                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Customers</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {loading ? "..." : (stats?.customers || 0)}
                        </h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Assets Value</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {loading ? "..." : formatCurrency(stats?.assets_value?.total_value || 0)}
                            </h3>
                        </div>
                    </div>

                    {/* Breakdown */}
                    <div className="space-y-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-amber-500 font-medium flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Gold
                            </span>
                            <div className="text-right">
                                <span className="text-gray-900 dark:text-white font-bold block">{stats?.assets_value?.gold?.weight || 0}g</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(stats?.assets_value?.gold?.value || 0)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400 font-medium flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div> Silver
                            </span>
                            <div className="text-right">
                                <span className="text-gray-900 dark:text-white font-bold block">{stats?.assets_value?.silver?.weight || 0}g</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(stats?.assets_value?.silver?.value || 0)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-12 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center opacity-60">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4">domain</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Business Overview</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">
                    Detailed profit/loss statements and historical analytics will be available here soon.
                </p>
            </div>
        </div>
    );
};

export default BusinessOverviewDashboard;
