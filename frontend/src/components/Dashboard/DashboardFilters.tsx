import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";

interface Branch {
    id: number;
    branch_name: string;
    location: string | null;
}

interface DashboardFiltersProps {
    onFilterChange: (filters: { branch_id?: number; start_date?: string; end_date?: string }) => void;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onFilterChange }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await api.get("/branches");
            setBranches(response.data);
        } catch (error) {
            console.error("Error fetching branches:", error);
        }
    };

    const handleApply = () => {
        onFilterChange({
            branch_id: selectedBranch === '' ? undefined : selectedBranch,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
        });
    };

    const handleClear = () => {
        setSelectedBranch('');
        setStartDate('');
        setEndDate('');
        onFilterChange({});
    };

    return (
        <div className="bg-white dark:bg-[#1A1D1F] p-4 md:p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                {/* Branch Section */}
                <div className="flex-1 w-full lg:max-w-xs">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-xl">store</span>
                        <span className="text-sm font-bold uppercase tracking-wider">Branch</span>
                    </div>
                    <div className="relative">
                        <select
                            value={selectedBranch}
                            onChange={(e) => setSelectedBranch(e.target.value ? Number(e.target.value) : '')}
                            className="w-full h-11 bg-gray-50 dark:bg-[#272B30] border border-gray-200 dark:border-gray-700 rounded-xl px-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">All Branches</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.branch_name}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none">
                            expand_more
                        </span>
                    </div>
                </div>

                <div className="hidden lg:block w-px h-12 bg-gray-100 dark:bg-gray-800" />

                {/* Date Selection Section */}
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2 text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined text-xl">calendar_month</span>
                        <span className="text-sm font-bold uppercase tracking-wider">Time Period</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative flex-1 min-w-[140px]">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-9 bg-gray-50 dark:bg-[#272B30] border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 transition-all font-medium"
                                title="Start Date"
                            />
                        </div>
                        <span className="text-gray-400 material-symbols-outlined">arrow_forward</span>
                        <div className="relative flex-1 min-w-[140px]">
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-9 bg-gray-50 dark:bg-[#272B30] border border-gray-200 dark:border-gray-700 rounded-lg px-3 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 transition-all font-medium"
                                title="End Date"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 w-full lg:w-auto pt-2 lg:pt-6">
                    <button
                        onClick={handleApply}
                        className="flex-1 lg:flex-none bg-[#00E676] hover:bg-[#00C853] text-black font-bold h-11 px-8 rounded-xl shadow-lg shadow-[#00E676]/20 transition-all flex items-center justify-center gap-2 group"
                    >
                        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">filter_list</span>
                        Apply
                    </button>
                    {(selectedBranch !== '' || startDate !== '' || endDate !== '') && (
                        <button
                            onClick={handleClear}
                            className="bg-red-50 dark:bg-red-900/10 text-red-600 h-11 px-4 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center"
                            title="Clear Filters"
                        >
                            <span className="material-symbols-outlined">restart_alt</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DashboardFilters;
