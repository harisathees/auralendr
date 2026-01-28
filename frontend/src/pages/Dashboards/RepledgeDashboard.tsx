import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { Wallet, CheckCircle2, AlertCircle, Building2 } from "lucide-react";

interface RepledgeStatItem {
    count: number;
    amount: number;
}

interface DashboardStats {
    repledge_stats: {
        total: RepledgeStatItem;
        active: RepledgeStatItem;
        released: RepledgeStatItem;
        overdue: RepledgeStatItem;
    };
}

interface Props {
    filters?: { branch_id?: number; start_date?: string; end_date?: string };
}

const DetailedRepledgeCard = ({ title, data, icon, color }: { title: string, data?: RepledgeStatItem, icon: React.ReactNode, color: string }) => {

    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="bg-white dark:bg-[#1A1D1F] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{data?.count || 0} <span className="text-sm font-normal text-gray-500">Repledges</span></h3>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-t border-dashed border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(data?.amount || 0)}</span>
                </div>
            </div>
        </div>
    );
}

const RepledgeDashboard: React.FC<Props> = ({ filters = {} }) => {
    // const [loading, setLoading] = useState(true); // Unused
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetchStats();
    }, [filters]);

    const fetchStats = async () => {
        // setLoading(true);
        try {
            const response = await api.get("/dashboard/stats", { params: filters });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
        } finally {
            // setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <DetailedRepledgeCard
                    title="Total Repledged"
                    data={stats?.repledge_stats?.total}
                    icon={<Wallet className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-50 dark:bg-purple-900/20"
                />
                <DetailedRepledgeCard
                    title="Active (In Bank)"
                    data={stats?.repledge_stats?.active}
                    icon={<Building2 className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-50 dark:bg-blue-900/20"
                />
                <DetailedRepledgeCard
                    title="Released"
                    data={stats?.repledge_stats?.released}
                    icon={<CheckCircle2 className="w-6 h-6 text-green-600" />}
                    color="bg-green-50 dark:bg-green-900/20"
                />
                <DetailedRepledgeCard
                    title="Overdue"
                    data={stats?.repledge_stats?.overdue}
                    icon={<AlertCircle className="w-6 h-6 text-red-600" />}
                    color="bg-red-50 dark:bg-red-900/20"
                />
            </div>

            <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-12 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center opacity-60">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4">analytics</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Repledge Analytics Coming Soon</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">
                    Detailed lists, bank-wise distribution, and payment schedules will be added here.
                </p>
            </div>
        </div>
    );
};

export default RepledgeDashboard;
