import React from "react";
import { TrendingUp, Users, Wallet, Building2 } from "lucide-react";

interface Props {
    filters?: { branch_id?: number; start_date?: string; end_date?: string };
}

const BusinessOverviewDashboard: React.FC<Props> = ({ filters: _filters = {} }) => {

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Turnover</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹0</h3>
                    </div>
                </div>


                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Net Profit</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹0</h3>
                    </div>
                </div>


                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Customers</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">0</h3>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1A1D1F] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Assets Value</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">₹0</h3>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1A1D1F] rounded-3xl p-12 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center text-center opacity-60">
                <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 text-6xl mb-4">domain</span>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Business Overview</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mt-2">
                    Comprehensive business analytics, profit/loss statements, and asset valuations will be displayed here.
                </p>
            </div>
        </div>
    );
};

export default BusinessOverviewDashboard;
