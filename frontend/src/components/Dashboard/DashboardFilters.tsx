import React, { useEffect, useState } from "react";
import api from "../../api/apiClient";
import {
    format,
    subDays,
    startOfMonth,
    endOfMonth,
    subMonths,
    startOfYear,
    endOfYear
} from "date-fns";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { Calendar as CalendarIcon } from "lucide-react";

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
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [isOpen, setIsOpen] = useState(false);
    const [activePreset, setActivePreset] = useState<string>('');

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
            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
        });
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelectedBranch('');
        setDateRange(undefined);
        setActivePreset('');
        onFilterChange({});
        setIsOpen(false);
    };

    const applyPreset = (type: string) => {
        const today = new Date();
        let range: DateRange | undefined;

        switch (type) {
            case 'today':
                range = { from: today, to: today };
                break;
            case 'yesterday':
                const yest = subDays(today, 1);
                range = { from: yest, to: yest };
                break;
            case 'last_7_days':
                range = { from: subDays(today, 6), to: today };
                break;
            case 'this_month':
                range = { from: startOfMonth(today), to: endOfMonth(today) };
                break;
            case 'last_month':
                const lastMonth = subMonths(today, 1);
                range = { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
                break;
            case 'this_year':
                range = { from: startOfYear(today), to: endOfYear(today) };
                break;
            default:
                range = undefined;
        }

        setDateRange(range);
        setActivePreset(type);
    };

    useEffect(() => {
        if (!dateRange) {
            setActivePreset('');
        }
    }, [dateRange]);

    return (
        <div className="flex items-center gap-3 relative">
            <div className="flex-1 max-w-xs relative group hidden md:block">
                <select
                    value={selectedBranch}
                    onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : '';
                        setSelectedBranch(val);
                        onFilterChange({
                            branch_id: val === '' ? undefined : val,
                            start_date: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
                            end_date: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
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

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-11 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md border ${isOpen || dateRange?.from
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white dark:bg-[#1A1D1F] text-gray-500 dark:text-gray-400 border-gray-100 dark:border-gray-800'
                    }`}
            >
                {isLoading ? (
                    <span className="material-symbols-outlined text-xl animate-spin">sync</span>
                ) : (
                    <CalendarIcon className="w-5 h-5" />
                )}
                <span className="text-sm font-bold hidden sm:inline">
                    {dateRange?.from ? (
                        <>
                            {format(dateRange.from, 'MMM dd')}
                            {dateRange.to && ` - ${format(dateRange.to, 'MMM dd')}`}
                        </>
                    ) : (
                        "Select Dates"
                    )}
                </span>
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
                    <div className="absolute top-14 right-0 bg-white dark:bg-[#1A1D1F] rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 p-0 z-[70] animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col md:flex-row w-[320px] md:w-auto">

                        <div className="bg-gray-50 dark:bg-[#202428] p-4 flex flex-col gap-2 min-w-[160px] border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700">
                            <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">Presets</h3>
                            {[
                                { label: 'Today', value: 'today' },
                                { label: 'Yesterday', value: 'yesterday' },
                                { label: 'Last 7 Days', value: 'last_7_days' },
                                { label: 'This Month', value: 'this_month' },
                                { label: 'Last Month', value: 'last_month' },
                                { label: 'This Year', value: 'this_year' },
                            ].map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => applyPreset(preset.value)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${activePreset === preset.value
                                            ? 'bg-purple-600 text-white shadow-purple-600/20 shadow-lg'
                                            : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>

                        <div className="p-4 md:p-6">
                            <div className="mb-4">
                                <DayPicker
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={(range) => {
                                        setDateRange(range);
                                        setActivePreset('');
                                    }}
                                    numberOfMonths={1}
                                    showOutsideDays
                                    className="border-0 p-0 m-0"
                                    classNames={{
                                        caption: "flex justify-center relative items-center pt-1 mb-4",
                                        caption_label: "text-sm font-bold text-gray-900 dark:text-white",
                                        nav: "space-x-1 flex items-center",
                                        nav_button: "h-7 w-7 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors text-gray-500",
                                        nav_button_previous: "absolute left-1",
                                        nav_button_next: "absolute right-1",
                                        table: "w-full border-collapse space-y-1",
                                        head_row: "flex mb-2",
                                        head_cell: "text-gray-400 rounded-md w-9 font-bold text-[0.8rem]",
                                        row: "flex w-full mt-2",
                                        cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-purple-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 dark:[&:has([aria-selected])]:bg-purple-900/20",
                                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-700 dark:text-gray-300 font-medium text-sm",
                                        day_selected: "bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white rounded-lg shadow-md",
                                        day_today: "bg-gray-100 dark:bg-gray-800 text-purple-600 font-bold",
                                        day_outside: "text-gray-300 opacity-50 dark:text-gray-600",
                                        day_disabled: "text-gray-300 opacity-50 dark:text-gray-600",
                                        day_range_middle: "aria-selected:bg-purple-50 dark:aria-selected:bg-purple-900/20 aria-selected:text-purple-700 dark:aria-selected:text-purple-300 rounded-none",
                                        day_hidden: "invisible",
                                    }}
                                />
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={handleClear}
                                    className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors px-2 py-2"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={handleApply}
                                    disabled={isLoading || !dateRange?.from}
                                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 transition-all active:scale-95"
                                >
                                    Apply Range
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardFilters;
