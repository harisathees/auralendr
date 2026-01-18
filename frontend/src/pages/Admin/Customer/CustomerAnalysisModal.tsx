import React, { useEffect, useState } from 'react';
import { X, TrendingUp, IndianRupee, Briefcase, Archive, Scale, AlertTriangle, Calendar, Award } from 'lucide-react';
import api from '../../../api/apiClient';
import GoldCoinSpinner from '../../../components/Shared/LoadingGoldCoinSpinner/GoldCoinSpinner';

interface AnalysisData {
    active_pledges_count: number;
    active_pledges_amount: number;
    overdue_pledges_count: number;
    total_gold_weight: number;
    closed_pledges_count: number;
    total_interest_paid: number;
    default_pledges_count: number;
    customer_since: string | null;
    lifetime_loan_amount: number;
}

interface CustomerAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    customerId: number | null;
    customerName: string;
}

const CustomerAnalysisModal: React.FC<CustomerAnalysisModalProps> = ({
    isOpen,
    onClose,
    customerId,
    customerName,
}) => {
    const [data, setData] = useState<AnalysisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && customerId) {
            fetchAnalysis();
        } else {
            setData(null);
            setLoading(true);
        }
    }, [isOpen, customerId]);

    const fetchAnalysis = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/api/customers/${customerId}/analysis`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching analysis:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all scale-100 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex-none flex items-center justify-between px-8 py-6 bg-white dark:bg-[#0F172A] border-b border-gray-100 dark:border-gray-800 z-10">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            Customer Intelligence
                        </h2>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-sm font-medium text-gray-400">Analysis for</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-sm font-semibold text-gray-900 dark:text-gray-200 border border-gray-200 dark:border-white/10">
                                {customerName}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-8 bg-gray-50/50 dark:bg-[#0F172A]">
                    {loading ? (
                        <div className="flex h-full items-center justify-center min-h-[400px]">
                            <GoldCoinSpinner />
                        </div>
                    ) : data ? (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">

                            {/* Current Portfolio Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Current Portfolio</h3>
                                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <PremiumStatCard
                                        title="Active Pledges"
                                        value={data.active_pledges_count}
                                        icon={<Briefcase />}
                                        colorClass="from-blue-500 to-cyan-500"
                                        trend="Currently Active"
                                    />
                                    <PremiumStatCard
                                        title="Active Loan Amount"
                                        value={`₹${data.active_pledges_amount.toLocaleString()}`}
                                        icon={<IndianRupee />}
                                        colorClass="from-emerald-500 to-teal-500"
                                    />
                                    <PremiumStatCard
                                        title="Gold Holdings"
                                        value={data.total_gold_weight.toFixed(3)}
                                        unit="g"
                                        icon={<Scale />}
                                        colorClass="from-amber-400 to-orange-500"
                                        trend="Net Weight"
                                    />
                                </div>
                            </section>

                            {/* Risk Profile Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Risk & Tenure</h3>
                                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 ${data.overdue_pledges_count > 0
                                        ? 'bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30'
                                        : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/5'
                                        }`}>
                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Status</p>
                                                <div className="mt-2 flex items-baseline gap-2">
                                                    <span className={`text-2xl font-bold ${data.overdue_pledges_count > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                                        {data.overdue_pledges_count > 0 ? 'Attention Needed' : 'Good Standing'}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mt-1 ${data.overdue_pledges_count > 0 ? 'text-red-500/80' : 'text-green-500/80'}`}>
                                                    {data.overdue_pledges_count} pledges overdue or defaulted
                                                </p>
                                            </div>
                                            <div className={`p-3 rounded-xl ${data.overdue_pledges_count > 0 ? 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400'}`}>
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                                        <div className="flex items-start justify-between relative z-10">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Relationship Since</p>
                                                <div className="mt-2">
                                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {data.customer_since ? new Date(data.customer_since).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-indigo-500 mt-1">Valued Customer</p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Lifetime Value Section */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Lifetime Value</h3>
                                    <div className="h-px bg-gray-200 dark:bg-gray-800 flex-1"></div>
                                </div>
                                <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    <div className="absolute bottom-0 left-0 p-24 bg-indigo-500/20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 divide-y md:divide-y-0 md:divide-x divide-white/10">
                                        <div className="text-center md:text-left md:pr-4">
                                            <div className="flex items-center gap-2 mb-2 text-gray-400 justify-center md:justify-start">
                                                <Archive className="w-4 h-4" />
                                                <span className="text-sm font-medium">Closed Pledges</span>
                                            </div>
                                            <p className="text-3xl font-bold tracking-tight text-white">{data.closed_pledges_count}</p>
                                            <p className="text-xs text-gray-500 mt-1">Successfully completed</p>
                                        </div>

                                        <div className="text-center md:text-left md:px-4 pt-4 md:pt-0">
                                            <div className="flex items-center gap-2 mb-2 text-gray-400 justify-center md:justify-start">
                                                <Award className="w-4 h-4" />
                                                <span className="text-sm font-medium">Lifetime Business</span>
                                            </div>
                                            <p className="text-3xl font-bold tracking-tight text-white">₹{data.lifetime_loan_amount.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Total loan volume</p>
                                        </div>

                                        <div className="text-center md:text-left md:pl-4 pt-4 md:pt-0">
                                            <div className="flex items-center gap-2 mb-2 text-amber-400 justify-center md:justify-start">
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-sm font-medium">Interest Revenue</span>
                                            </div>
                                            <p className="text-3xl font-bold tracking-tight text-amber-400">₹{data.total_interest_paid.toLocaleString()}</p>
                                            <p className="text-xs text-gray-500 mt-1">Total earnings</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-64 text-gray-500">
                            <div className="text-center">
                                <p className="text-lg">No data available</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

interface PremiumStatCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon: React.ReactNode;
    colorClass: string;
    trend?: string;
}

const PremiumStatCard: React.FC<PremiumStatCardProps> = ({
    title,
    value,
    unit,
    icon,
    colorClass,
    trend,
}) => (
    <div className="bg-white dark:bg-white/5 rounded-2xl p-5 border border-gray-100 dark:border-white/5 relative overflow-hidden group hover:shadow-lg transition-all duration-300 hover:border-gray-200 dark:hover:border-white/10">
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClass} text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                {React.cloneElement(icon as React.ReactElement<any>, { size: 20, strokeWidth: 2.5 })}
            </div>
            {trend && (
                <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-gray-50 dark:bg-white/10 text-gray-500 dark:text-gray-400">
                    {trend}
                </span>
            )}
        </div>

        <div className="relative z-10">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    {value}
                </span>
                {unit && (
                    <span className="text-sm font-semibold text-gray-400">{unit}</span>
                )}
            </div>
        </div>

        {/* Decorative faint background circle */}
        <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-xl bg-gradient-to-br ${colorClass}`}></div>
    </div>
);

export default CustomerAnalysisModal;
