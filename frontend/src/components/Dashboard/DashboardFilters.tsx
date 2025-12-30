import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";

interface Branch {
    id: number;
    branch_name: string;
    location: string | null;
}

interface DashboardFiltersProps {
    onFilterChange: (filters: { branch_id?: number; start_date?: string; end_date?: string }) => void;
    isLoading?: boolean;
}

const DashboardFilters: React.FC<DashboardFiltersProps> = ({ onFilterChange, isLoading }) => {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<number | ''>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchBranches();
    }, []);

    const fetchBranches = async () => {
        try {
            const response = await api.get("/api/branches");
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
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedBranch('');
        setStartDate('');
        setEndDate('');
        onFilterChange({});
        setIsOpen(false);
    };

    return (
        <div className="flex items-center gap-3 relative">
            {/* Branch Selector - Sleek Version */}
            <div className="flex-1 max-w-xs relative group">
                <select
                    value={selectedBranch}
                    onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : '';
                        setSelectedBranch(val);
                        onFilterChange({
                            branch_id: val === '' ? undefined : val,
                            start_date: startDate || undefined,
                            end_date: endDate || undefined,
                        });
                    }}
                    className="w-full h-11 bg-white dark:bg-[#1A1D1F] border border-gray-100 dark:border-gray-800 rounded-2xl px-5 pr-10 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all appearance-none cursor-pointer shadow-sm hover:shadow-md"
                >
                    <option value="">All Branches</option>
                    {branches.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                            {branch.branch_name}
                        </option>
                    ))}
                </select>
                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-gray-400 pointer-events-none text-xl group-hover:text-purple-600 transition-colors">
                    expand_more
                </span>
            </div>

            {/* Filter Toggle Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm hover:shadow-md relative ${isOpen ? 'bg-purple-600 text-white' : 'bg-white dark:bg-[#1A1D1F] text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-800'}`}
            >
                {isLoading ? (
                    <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                ) : (
                    <span className="material-symbols-outlined text-xl">tune</span>
                )}
                {!isOpen && (startDate || endDate) && !isLoading && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full border-2 border-white dark:border-[#1A1D1F]"></span>
                )}
            </button>

            {/* Advanced Filters Popover */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-14 right-0 w-80 bg-white dark:bg-[#1A1D1F] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-6 z-[70] animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Date Range</h3>
                            {(startDate || endDate) && (
                                <button onClick={handleClear} className="text-[10px] font-black text-red-500 uppercase hover:underline">Reset</button>
                            )}
                        </div>

                        <div className="space-y-4 mb-8">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2 px-1">From Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full h-11 bg-gray-50 dark:bg-[#272B30] border border-gray-100 dark:border-gray-800 rounded-xl px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-2 px-1">To Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full h-11 bg-gray-50 dark:bg-[#272B30] border border-gray-100 dark:border-gray-800 rounded-xl px-4 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 transition-all font-bold"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleApply}
                            disabled={isLoading}
                            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-black h-12 rounded-2xl shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                            ) : (
                                <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">check</span>
                            )}
                            {isLoading ? 'Applying...' : 'Apply Filter'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardFilters;
