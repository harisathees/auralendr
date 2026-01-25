import React, { useEffect, useState } from "react";
import api from "../../../api/apiClient";
import type { MoneySource, Branch, MoneySourceType } from "../../../types/models";

interface MoneySourceFormProps {
    initialData: MoneySource | null;
    onSuccess: () => void;
    onCancel: () => void;
    isReadOnly?: boolean;
}

const MoneySourceForm: React.FC<MoneySourceFormProps> = ({ initialData, onSuccess, onCancel, isReadOnly = false }) => {
    const [name, setName] = useState("");
    const [type, setType] = useState("cash");
    const [balance, setBalance] = useState("0");
    const [description, setDescription] = useState("");

    // Checkboxes
    const [isOutbound, setIsOutbound] = useState(true);
    const [isInbound, setIsInbound] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [showBalance, setShowBalance] = useState(true);

    // Branch Selection
    const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
    const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([]);

    // Dynamic Types
    const [moneySourceTypes, setMoneySourceTypes] = useState<MoneySourceType[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBranches();
        fetchMoneySourceTypes();
    }, []);

    const fetchBranches = async () => {
        try {
            const res = await api.get("/branches");
            setAvailableBranches(res.data);
        } catch (err) {
            console.error("Failed to fetch branches");
        }
    };

    const fetchMoneySourceTypes = async () => {
        try {
            const res = await api.get("/money-source-types");
            setMoneySourceTypes(res.data);
        } catch (err) {
            console.error("Failed to fetch money source types");
        }
    };

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setBalance(initialData.balance);
            setDescription(initialData.description || "");
            setIsOutbound(initialData.is_outbound !== false);
            setIsInbound(initialData.is_inbound !== false);
            setIsActive(initialData.is_active !== false);
            setShowBalance(initialData.show_balance !== false);

            // Pre-select branches if editing
            if (initialData.branches) {
                setSelectedBranchIds(initialData.branches.map(b => b.id));
            }
        } else {
            // Reset defaults for new
            setName("");
            setType("cash");
            setBalance("0");
            setDescription("");
            setIsOutbound(true);
            setIsInbound(true);
            setIsActive(true);
            setShowBalance(true);
            setSelectedBranchIds([]);
        }
    }, [initialData]);

    const handleBranchToggle = (branchId: string) => {
        if (selectedBranchIds.includes(branchId)) {
            setSelectedBranchIds(selectedBranchIds.filter(id => id !== branchId));
        } else {
            setSelectedBranchIds([...selectedBranchIds, branchId]);
        }
    };

    const handleSelectAllBranches = () => {
        if (selectedBranchIds.length === availableBranches.length) {
            setSelectedBranchIds([]);
        } else {
            setSelectedBranchIds(availableBranches.map(b => b.id));
        }
    };

    const handleSubmit = async () => {
        if (!name || !balance) return;

        setLoading(true);
        const payload = {
            name,
            type,
            balance,
            description,
            is_outbound: isOutbound,
            is_inbound: isInbound,
            is_active: isActive,
            show_balance: showBalance,
            branch_ids: selectedBranchIds
        };

        try {
            if (initialData) {
                await api.put(`/money-sources/${initialData.id}`, payload);
            } else {
                await api.post("/money-sources", payload);
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save money source", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0">
                <h2 className="text-lg font-bold text-primary-text dark:text-white">
                    {isReadOnly ? "View Payment Method" : (initialData ? "Edit Payment Method" : "Add Payment Method")}
                </h2>
                <div className="flex items-center gap-3">
                    <div
                        onClick={() => !isReadOnly && setIsActive(!isActive)}
                        className={`flex items-center gap-1.5 p-1 px-3 text-xs font-bold rounded-full transition-all ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isActive
                            ? 'bg-green-500 text-white shadow-md'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                            }`}
                    >
                        <span className="material-symbols-outlined text-[14px]">check</span>
                        {isActive ? 'Active' : 'Inactive'}
                    </div>
                    <button onClick={onCancel} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Name</span>
                    <input
                        className={`form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none transition-all ${isReadOnly ? 'cursor-default' : ''}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Shop Cash, HDFC Bank"
                        readOnly={isReadOnly}
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-primary-text dark:text-white">Type</span>
                        <div className="relative">
                            <select
                                className={`form-select w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary h-12 px-4 text-sm outline-none appearance-none transition-all ${isReadOnly ? 'cursor-default pointer-events-none' : ''}`}
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                disabled={isReadOnly}
                            >
                                {moneySourceTypes.map(t => (
                                    <option key={t.id} value={t.value} className="bg-white dark:bg-gray-800">{t.name}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-3 pointer-events-none text-gray-500 text-sm">expand_more</span>
                        </div>
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Opening Balance</span>
                        <div className="relative flex items-center">

                            {/* Currency Prefix */}
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                                ₹
                            </span>

                            <input
                                type="number"
                                // 👇 ADDED CLASSES HERE to hide increment/decrement arrows
                                className={`form-input w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/50 h-12 pl-8 pr-12 text-sm font-semibold outline-none transition-all
            [appearance:textfield] 
            [&::-webkit-outer-spin-button]:appearance-none 
            [&::-webkit-inner-spin-button]:appearance-none 
            [&::-webkit-outer-spin-button]:m-0 
            [&::-webkit-inner-spin-button]:m-0 ${isReadOnly ? 'cursor-default' : ''}`}
                                // 👆 END OF ADDED CLASSES
                                value={balance}
                                onChange={(e) => setBalance(e.target.value)}
                                placeholder="0.00"
                                readOnly={isReadOnly}
                            />

                            {/* Visibility Toggle Button */}
                            <button
                                type="button"
                                onClick={() => !isReadOnly && setShowBalance(!showBalance)}
                                title={showBalance ? "Hide Balance" : "Show Balance"}
                                className={`absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${isReadOnly ? 'cursor-default' : 'hover:bg-gray-200 dark:hover:bg-gray-700'} ${showBalance
                                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                                    : 'text-gray-400 dark:text-gray-500'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[16px]">
                                    {showBalance ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>
                        </div>
                    </label>
                </div>

                <label className="flex flex-col gap-1.5">
                    <span className="text-sm font-bold text-primary-text dark:text-white">Description</span>
                    <textarea
                        className={`form-textarea w-full rounded-xl border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary p-4 text-sm outline-none min-h-[80px] resize-none transition-all ${isReadOnly ? 'cursor-default' : ''}`}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional details..."
                        readOnly={isReadOnly}
                    />
                </label>

                {/* Branch Selection - Moved Below Description */}
                <div className="flex flex-col gap-3"> {/* Increased main gap for breathing room */}
                    <div className="flex justify-between items-center px-1"> {/* Added horizontal padding to align with grid */}
                        <span className="text-base font-extrabold text-gray-800 dark:text-gray-100">Assign to Branches</span> {/* Slightly larger, stronger title */}
                        <button
                            type="button"
                            onClick={handleSelectAllBranches}
                            disabled={isReadOnly}
                            className={`text-sm font-semibold transition-colors ${isReadOnly ? 'text-gray-400 cursor-default' : 'text-primary hover:text-primary-dark dark:hover:text-primary-light'}`} // Adjusted text size/weight
                        >
                            {selectedBranchIds.length === availableBranches.length ? 'Deselect All' : 'Select All'}
                        </button>
                    </div>

                    {/* Grid Container */}
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                        {availableBranches.map(branch => {
                            const isSelected = selectedBranchIds.includes(branch.id);
                            return (
                                <div
                                    key={branch.id}
                                    onClick={() => !isReadOnly && handleBranchToggle(branch.id)}
                                    className={`aspect-square flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl border transition-all duration-200 relative ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isSelected
                                        ? 'bg-primary/10 border-primary shadow-sm ring-1 ring-primary/50' // Added ring for subtle focus on select
                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50 hover:shadow-md' // Enhanced hover effect
                                        }`}>

                                    {/* Icon Container */}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isSelected
                                        ? 'bg-primary text-white shadow-inner'
                                        : 'bg-gray-50 dark:bg-gray-700 text-gray-400 group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary' // Primary color on hover
                                        }`}>
                                        <span className="material-symbols-outlined text-[16px]">store</span> {/* Slightly smaller icon */}
                                    </div>

                                    {/* Branch Name */}
                                    <span className={`text-[11px] font-medium text-center leading-snug line-clamp-2 ${isSelected
                                        ? 'text-primary-dark dark:text-primary'
                                        : 'text-gray-600 dark:text-gray-300' // Darker text for better contrast
                                        }`}>
                                        {branch.branch_name}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Toggles - Redesigned as Compact Buttons */}
                <div className="flex flex-col gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">

                    {/* Header & Status/Balance Buttons (New Layout) */}
                    {/* Header & Status/Balance Buttons (New Layout) */}
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Transaction Filters</span>
                    </div>

                    {/* Send & Receive Toggles (Smaller/Compact) */}
                    <div className="grid grid-cols-2 gap-2">
                        {/* Outbound (Send) - Compacted */}
                        <div
                            onClick={() => !isReadOnly && setIsOutbound(!isOutbound)}
                            className={`flex items-center justify-center p-1.5 rounded-lg border-2 transition-all active:scale-95 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isOutbound
                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 ${isOutbound ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wide ${isOutbound ? 'text-blue-700 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                Send
                            </span>
                        </div>

                        {/* Inbound (Receive) - Compacted */}
                        <div
                            onClick={() => !isReadOnly && setIsInbound(!isInbound)}
                            className={`flex items-center justify-center p-1.5 rounded-lg border-2 transition-all active:scale-95 ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isInbound
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-500 dark:border-purple-400'
                                : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-1 ${isInbound ? 'bg-purple-500 text-white' : 'bg-gray-100 text-gray-400'
                                }`}>
                                <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
                            </div>
                            <span className={`text-xs font-bold uppercase tracking-wide ${isInbound ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                Receive
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 mb-4">
                    <button
                        onClick={onCancel}
                        className={`px-6 py-3 rounded-xl font-bold transition-colors ${isReadOnly ? 'w-full bg-gray-100 dark:bg-gray-800 text-primary hover:bg-gray-200 dark:hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        {isReadOnly ? "Close" : "Cancel"}
                    </button>
                    {!isReadOnly && (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Saving..." : "Save Payment Method"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MoneySourceForm;
